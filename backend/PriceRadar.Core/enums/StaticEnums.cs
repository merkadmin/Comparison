namespace PriceRadar.Core.enums
{
	public enum DBStore
	{
		Amazon = 1,
		BestBuy = 2,
		Walmart = 3,
		Target = 4,
		Costco = 5,
		Newegg = 6,
		Ebay = 7,
		AliExpress = 8,
		Samsung = 9,
		LG = 10,
		Sony = 11,
		Dell = 12,
		Hp = 13,
		MicrosoftStore = 14,
		BhPhotoVideo = 15,
		FrySelectronics = 16,
		Macys = 17,
		Kohls = 18,
		JcPenney = 19,
		Homedepot = 20,
		LoweS = 21,
		Ikea = 22,
		CostcoWholesale = 23,
		Wayfair = 24,
		Zappos = 25
	}

	public enum DBStoreType
	{
		Online = 1,
		Physical = 2
	}

	public enum DBPriceHistoryType
	{
		Regular = 1,
		Sale = 2,
		Promotion = 3
	}

	public enum DBSellingPriceType
	{
		Regular = 1,
		Premium = 2,
		Offer   = 3
	}

	public enum DBUserPrivilege
	{
		Regular = 0,
		Premium = 1,
		Admin = 2
	}
}
