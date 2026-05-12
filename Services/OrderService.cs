using Lanchonete.DTOs;
using Lanchonete.Enums;
using Lanchonete.Interfaces;
using Lanchonete.Models;
using Lanchonete.Repository;
using Microsoft.AspNetCore.Mvc;

namespace Lanchonete.Services;

public class OrderService : IOrderService
{
    private readonly IPaymentService _paymentService;
    private readonly IOrderRepository _repository;
    private readonly IProductRepository _productRepository;
    
    public OrderService(IOrderRepository repository, IPaymentService paymentService, IProductRepository productRepository)
    {
        _repository = repository;
        _paymentService = paymentService;
        _productRepository = productRepository;
    }
    
    private static OrderResponseDTO MapToResponse(Order order)
    {
        return new OrderResponseDTO
        {
            OrderId = order.Id,
            UserId = order.UserId,
            OrderStatus = order.Status.ToString(),
            CreatedAt = order.CreatedAt,
            TotalPrice = order.TotalPrice,
            OrderItems = order.Items?.Select(x => new OrderItemResponseDTO
            {
                Id = x.Id,
                OrderId = x.OrderId,
                ProductId = x.ProductId,
                ProductName = x.Product?.Name ?? string.Empty,
                Quantity = x.Quantity,
                Price = x.Product?.Price ?? 0,
                TotalPrice = (x.Product?.Price ?? 0) * x.Quantity,
            }).ToList() ?? new List<OrderItemResponseDTO>()
        };
    }
    
    public async Task<List<OrderResponseDTO>> GetOrders()
    {
        var resultQuery = await _repository.GetAllAsync();
        return resultQuery.Select(MapToResponse).ToList();
    }

    public async Task<List<OrderResponseDTO>> GetOrdersByUserId(int userId)
    {
        var resultQuery = await _repository.GetAllAsync();
        return resultQuery
            .Where(o => o.UserId == userId)
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<OrderResponseDTO> GetOrderById(int orderId)
    {
        var resultQuery = await _repository.GetByIdAsync(orderId);
        return resultQuery == null ? null : MapToResponse(resultQuery);
    }
public async Task<OrderResponseDTO> CreateOrder(OrderRequestDTO orderRequest)
{
    decimal total = 0;
    var orderItems = new List<OrderItem>();

    foreach (var itemRequest in orderRequest.Items)
    {
        var product = await _productRepository.GetByIdAsync(itemRequest.ProductId);
        if (product == null) continue;

        orderItems.Add(new OrderItem
        {
            ProductId = product.Id,
            Quantity = itemRequest.Quantity
        });

        total += (product.Price * itemRequest.Quantity);
    }

    var order = new Order
    {
        UserId = orderRequest.UserId,
        Status = OrderStatus.PENDING,
        CreatedAt = DateTime.Now,
        TotalPrice = total,
        Items = orderItems
    };

    
    if (_paymentService.ProcessPayment())
    {
        order.Status = OrderStatus.PAID;
    }

    var result = await _repository.AddAsync(order);
    return MapToResponse(result);
}

    public async Task<OrderResponseDTO> UpdateOrder(int orderId)
    {
        var order = await _repository.GetByIdAsync(orderId);
        if (order == null) return null;
        
        decimal total = 0;
        foreach (var item in order.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product != null)
                total += (product.Price * item.Quantity);
        }
        
        order.TotalPrice = total;
        var result = await _repository.UpdateAsync(order);
        return MapToResponse(result);
    }
    
    public async Task<bool> updateStatus(int orderId, OrderStatus status)
    {
        var order = await _repository.GetByIdAsync(orderId);
        if (order == null) return false;

        var canUpdate = (order.Status, status) switch
        {
            (OrderStatus.PENDING, OrderStatus.PAID) => true,
            (OrderStatus.PAID, OrderStatus.PREPARING) => true,
            (OrderStatus.PREPARING, OrderStatus.COMPLETED) => true,
            (_, OrderStatus.CANCELED) => order.Status != OrderStatus.COMPLETED,
            _ => false
        };

        if (canUpdate)
        {
            order.Status = status;
            await _repository.UpdateAsync(order);
            return true;
        }

        return false;
    }

    public async Task<OrderResponseDTO> Checkout(int orderId)
    {
        var order = await _repository.GetByIdAsync(orderId);
        if (order == null) return null;

        foreach (var item in order.Items)
        {
            if (item.Product == null)
                throw new Exception("Um ou mais produtos do pedido não estão mais disponíveis. Por favor, atualize seu carrinho.");

            if (item.Quantity > item.Product.StockQuantity)
                throw new Exception($"Quantidade solicitada indisponível para \"{item.Product.Name}\". Estoque atual: {item.Product.StockQuantity} unidade(s).");
        }
        
        if (!_paymentService.ProcessPayment())
            throw new Exception("O pagamento foi recusado.");

        order.Status = OrderStatus.PAID;
        
        foreach (var item in order.Items)
        {
            if (item.Product != null)
            {
                item.Product.StockQuantity -= item.Quantity;
                await _productRepository.UpdateAsync(item.Product);
            }
        }

        await _repository.UpdateAsync(order);
        return MapToResponse(order);
    }
}


