// amadeus.d.ts
declare module 'amadeus' {
  class Amadeus {
    constructor(options: { clientId: string; clientSecret: string });
    shopping: {
      flightOffersSearch: {
        get(params: {
          originLocationCode: string;
          destinationLocationCode: string;
          departureDate: string;
          adults: string;
        }): Promise<{ data: any }>;
      };
    };
  }

  export default Amadeus;
}
