import { useLoaderData } from '@remix-run/react';
import { defer, json } from '@shopify/remix-oxygen';
import React from 'react'

export async function loader({context}) {
    const {storefront} = context;
    const recommendedProducts =await storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  
    return json({ recommendedProducts});
  }

export default function sample() {
    const data = useLoaderData();
    console.log(data?.recommendedProducts?.products?.nodes)
  return (
    <div > 
     <h2 className='title text-blue-700'>Recommended Products</h2>
     <hr/>
     <div className='flex content-center items-center'>
        {data?.recommendedProducts?.products?.nodes.map((item)=>{
            return (
        <div key={item.id} className='product_container flex-column m-2' >
          <img className='w-30 h-30' src={item.images.nodes[0].url}/>
           <p className='m-2'> {item.title} </p>
        <h3 className='m-2 hover:text-red-500 hover:cursor-pointer'> {item.priceRange.minVariantPrice.amount} {item.priceRange.minVariantPrice.currencyCode}</h3>
        </div>
            )
        })}
     
     </div>


    </div>
  )
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;
