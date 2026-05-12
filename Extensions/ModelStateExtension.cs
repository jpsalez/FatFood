using Lanchonete.Models;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Lanchonete.Extensions;

public static class ModelStateExtension 
{
    public static List<string> GetErros(this ModelStateDictionary modelStates)
    {
        
        var result = new List<string>();

        if (!modelStates.IsValid)
            result.AddRange(modelStates.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage));
        
        return result;
    }
    
    
}