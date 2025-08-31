export const seedVehiclesData = [
	{
		make: 'Toyota',
		model: 'Camry',
		year: 2015,
		vin: 'JT1234567890CAMRY15',
		description: 'Clean title, good condition',
		purchasePrice: 6500,
		purchaseDate: new Date('2023-01-15'),
		auctionName: 'Copart',
		isPartedOut: false,
	},
	{
		make: 'Honda',
		model: 'Civic',
		year: 2017,
		vin: 'HN1234567890CIVIC17',
		description: 'Front damage, for parts',
		purchasePrice: 3500,
		purchaseDate: new Date('2023-03-20'),
		auctionName: 'IAAI',
		isPartedOut: true,
	},
];
