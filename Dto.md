- Request - от фронта к беку, Response - от бека к фронту
- ? означает необязательное поле
- UserRole - CUSTOMER/SELLER

Пример загрузки файла:
```js
const formData = new FormData(); 
formData.append('Title', this.title); 
formData.append('PublisherTitle', this.publisherTitle); 
formData.append('DeveloperTitle', this.developerTitle); formData.append('Price', this.price.toString());
formData.append('Description', this.description());

this.genres.forEach((g, i) => { 
	formData.append(`Genres[${i}].Title`, g.title); 
}); 

if(this.keysFile) { 
	formData.append('Keys', this.keysFile); 
} 
if (this.imageFile) { 
	formData.append('Image', this.imageFile); 
} 

await fetch('/api/games', 
	{   method: 'POST', 
		body: formData,
		credentials: "include",
	});
```

==Cart==
- ==CartItemRequest== ([Range(1, long.MaxValue)] long GameId, [Range(1, int.MaxValue)] int Quantity);
- ==CartItemResponse==(long GameId, string GameTitle, int Quantity);
- ==CartResponse==(List\<CartItemResponse> CartItems);

==User==
- ==CustomerResponse==(long Id, string Username, string Email, CartResponse CartResponse);
- ==SellerGameResponse==(long Id, string Title, decimal Price, List\<string> Keys, string ImageUrl);
- ==SellerResponse==(long Id, string Username, string Email, List\<GameResponse>\? Games);
- ==UserRequest== ([EmailAddress] string Email, [MinLength(2)] [MaxLength(100)] string Username, [MinLength(6)] string Password, UserRole UserRole);

==Game==

- ==GameRequest==([MinLength(2)][MaxLength(100)] string DeveloperTitle,  [MinLength(2)][MaxLength(100)] string PublisherTitle,  [Range(0.1, double.MaxValue)] decimal Price, [MinLength(2)][MaxLength(100)] string Title, [MaxLength(1000)] string? Description, [MinLength(1)] List\<GenreRequest> Genres, [Required] IFormFile Image); - **для обновления**

- ==GameResponse== (long Id, string PublisherTitle, string DeveloperTitle, decimal Price, 
        - string Title, string? Description, DateTime CreatedAt, List\<GenreResponse>\Genres, int Count, string ImageUrl);
        
- ==GameWithKeysRequest==
    {
	        [MinLength(2), MaxLength(100)]
	        public string DeveloperTitle { get; set; }
		    [MinLength(2), MaxLength(100)]
	        public string PublisherTitle { get; set; }
			[Range(0.1, double.MaxValue)]
	        public decimal Price { get; set; }
			[MinLength(2), MaxLength(100)]
	        public string Title { get; set; }
			[MaxLength(1000)]
	        public string? Description { get; set; }
			[MinLength(1)]
	        public List\<GenreRequest> Genres { get; set; }
	        [Required]
	        public IFormFile Keys { get; set; }
	        [Required]
	        public IFormFile Image { get; set; }
	   } - **для создания**

==Genre==
- ==GenreRequest==([MinLength(1)]string Title);
- ==GenreResponse==(string Title);

==Order==
- ==OrderItemRequest== ([Range(1, long.MaxValue)] long GameId, [Range(1, int.MaxValue)] int Quantity);
- ==OrderItemResponse== (string GameTitle, int Quantity, decimal Price);
- ==OrderRequest== ([MinLength(1)] List\<OrderItemRequest> OrderItems);
- ==OrderResponse== (List\<OrderItemResponse> OrderItems,  decimal TotalAmount, DateTime CreatedAt);

==Пагинация==
- ==Page==\<T>\( List\<T> Content, int PageNumber, int PageSize, long TotalElements, int TotalPages);
- ==Pageable==([Range(1, int.MaxValue)] int Page = 1, [Range(1, 100)] int PageSize = 20)

Page - это страница с контентом от бека
Pageable - указание от фронта какую страницу с каким размером нужно получить ему

==Фильтрация==
==FilterRequest==(decimal? MinPrice, decimal? MaxPrice, [MaxLength(100)] string? GameTitle, List\<string>\? Genres);

==ApiErrorResponse==(int StatusCode, string Message); - ошибка с  сообщением