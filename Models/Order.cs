using Lanchonete.Enums;

namespace Lanchonete.Models;

public class Order
{
     public int Id {get; set;}
     public int UserId {get; set;}
     public User User {get; set;} = null!;
     public List<OrderItem> Items {get; set;} = new List<OrderItem>();
     public  DateTime CreatedAt {get; set;}
     public OrderStatus Status { get; set; } = OrderStatus.PENDING;
     
     public decimal TotalPrice {get; set;}
     
     
     
}
