import { NextResponse } from "next/server";

export async function GET() {

  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=LYX`;

  try {
    const coinMarketResponse = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || "",
      },
    });

    if (!coinMarketResponse.ok) {
      throw new Error(`Error from CoinMarketCap: ${coinMarketResponse.statusText}`);
    }

    const data = await coinMarketResponse.json();
    return NextResponse.json(data.data.LYX.quote.USD.price.toFixed(2))
  } catch (error) {
    const errorResponse = {
      message: "Error fetching price",
      error: error instanceof Error ? error.message : "Unknown error"
    };

    // Use a 500 status code to indicate a server error
    return new NextResponse(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}