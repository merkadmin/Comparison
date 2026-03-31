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

	public enum DBNetworkTechnology
	{
		GSM = 1,
		CDMA,
		HSPA,
		EVDO,
		LTE,
		FiveG
	}

	public enum DBNetworkBand2G
	{
		GSM850 = 1,
		GSM900,
		GSM1800,
		GSM1900,
		CDMA800,
		CDMA1900
	}

	public enum DBNetworkBand3G
	{
		HSDPA800 = 1,
		HSDPA850,
		HSDPA900,
		HSDPA1700,
		HSDPA1900,
		HSDPA2100,
		CDMA2000
	}

	public enum DBNetworkBand4G
	{
		B1 = 1, B2, B3, B4, B5, B7, B8, B12, B13, B14,
		B17, B18, B19, B20, B25, B26, B28, B29, B30,
		B32, B34, B38, B39, B40, B41, B42, B46, B48,
		B66, B71
	}

	public enum DBNetworkBand5G
	{
		N1 = 1, N2, N3, N5, N7, N8, N12, N20, N25, N26,
		N28, N38, N40, N41, N48, N66, N71, N77, N78, N79,
		N257, N258, N260, N261
	}

	public enum DBNetworkSpeed
	{
		HSPA = 1,
		HSPAPlus,
		LTE,
		LTECat4,
		LTECat6,
		LTECat9,
		LTECat11,
		LTECat12,
		LTECat16,
		LTECat18,
		LTECat19,
		LTECat20,
		LTECat21,
		FiveG
	}

	public enum DBSpecificationCategory
	{
		Network = 1,
		Launch,
		Body,
		Display,
		Platform,
		Memory,
		MainCamera,
		SelfieCamera,
		Sound,
		Comms,
		Features,
		Battery
	}

	public enum DBVariantType
	{
		Color = 1,
		Size,
		Material,
		Style,
		Pattern,
		Brand,
		Model,
		Version,
		RamType,
		RamSize,
		HardDiskType,
		HardDiskSize,
		OperatingSystem,
		ScreenType,
		ScreenSize,
		Resolution,
		RefreshRate,
		CellularTechnology,
		Display,
		Platform,
		CameraMain,
		CameraFront,
		Battery,
		Body,
		Connectivity,
		Network,
		Sensors,
		Other
	}
}
