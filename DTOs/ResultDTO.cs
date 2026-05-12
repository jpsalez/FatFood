namespace Lanchonete.DTOs;

public class ResultDTO<T>
{
    public List<string> Errors { get; set; } = new List<string>();
    public T Data {get; set;} = default!;
    
    
    public ResultDTO( string error )
    {
        Errors.Add(error);
    }

    public ResultDTO(string error, T data)
    {
        Errors.Add(error);
        Data = data;
    }

    public ResultDTO(List<string> errors)
    {
        Errors.AddRange(errors);
    }


    public ResultDTO(T data)
    {
        Data = data;
    }
    
}
