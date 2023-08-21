import { useLoaderData } from '@remix-run/react';
import { CartForm } from '@shopify/hydrogen';
import { defer, json } from '@shopify/remix-oxygen';
import React from 'react'
export async function loader({context}) {
    const {storefront} = context;
    const recommendedProducts =await storefront.query(RECOMMENDED_PRODUCTS_QUERY);

    const twentyProducts =await storefront.query(FIRST_TWENTY_PRODUCTS,{
      variables:{
        first:20
      }
    }); 
    //console.log(twentyProducts)

  
    return json({ recommendedProducts, twentyProducts});
  }

export default function sample() {
    const data = useLoaderData();
    //console.log(data?.recommendedProducts?.products?.nodes);
    console.log("first:", data?.twentyProducts?.products.edges)
    console.log("first:", data?.twentyProducts?.products.nodes)
  return (
    <div > 
     <h2 className='title text-blue-700'>Recommended Products</h2>
     <hr/>
     <div className='flex content-center items-center'>
        {data?.recommendedProducts?.products?.nodes.map((item)=>{
            return (
        <div key={item.id} className='product_container flex-column m-2' >
          <img className='w-30 h-30' style={{maxHeight:150}} src={item.images.nodes[0].url}/>
           <p className='m-2'> {item.title} </p>
        <h3 className='m-2 hover:text-red-500 hover:cursor-pointer'> {item.priceRange.minVariantPrice.amount} {item.priceRange.minVariantPrice.currencyCode}</h3>
        </div>
            )
        })}
     
     </div>


     <h2 className='title text-blue-700'>Latest 20 Products</h2>
     <hr/>
     <div className='grid grid grid-cols-4 gap-4'>
        {data?.twentyProducts?.products?.nodes.map((item)=>{
            return (
        <div key={item.variants.nodes[0]?.id} className='product_container flex-column m-2 p-2 w-50 border border-indigo-600' >
          <img className='w-30 h-30' style={{maxHeight:150}} src={item.variants.nodes[0]?.image?.url} />
           <p className='m-2'> {item.variants.nodes[0]?.title} </p>
        <h3 className='m-2 hover:text-red-500 hover:cursor-pointer'> {item.variants.nodes[0]?.price.amount} BDT</h3>

        <AddToCartButton
        disabled={!item.variants.nodes[0] || !item.variants.nodes[0]?.availableForSale}
        onClick={() => {
          window.location.href = window.location.href + '#cart-aside';
        }}
        lines={
          item.variants.nodes[0]
            ? [
                {
                  merchandiseId: item.variants.nodes[0]?.id,
                  quantity: 1,
                },
              ]
            : []
        }
        available = {item.variants.nodes[0]?.availableForSale}
      >
        {item.variants.nodes[0]?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>

        </div>
            )
        })}
     
     </div>


    </div>
  )
}

function AddToCartButton({analytics, children, disabled, lines, onClick,available}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            className={available? "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" : "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4"}
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
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

const FIRST_TWENTY_PRODUCTS = `#graphql 
query getProducts($first: Int) {
  products(first: $first) {
     edges {
      cursor
      node {
        title
        id,
        images(first:1){
          nodes{
            url
          }
        },
        availableForSale,
        featuredImage {
          id,
          height,
          width,
          url,
          
        },
        handle,
        isGiftCard,
        priceRange{
          maxVariantPrice{
            amount,
            currencyCode
          },
          minVariantPrice{
            amount,
            currencyCode
          }
        },
        tags,
        totalInventory
      }
    }
    nodes{
      id,
      variants(first:5){
        nodes{
          id,
          title,
          image{
            url
          },
          availableForSale,
          price{
            amount
          },
          quantityAvailable,
          
          
    
        }
      }
    }
  }
}`