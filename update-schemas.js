const fs = require('fs');

const files = [
  'src/app/page.tsx',
  'src/app/naklejki-foliowe/page.tsx',
  'src/app/naklejki-dla-firm/page.tsx',
  'src/app/naklejki-die-cut/page.tsx',
  'src/app/fotonaklejki/page.tsx',
  'src/app/alternatywa-dla-sticker-mule-i-stickerapp/page.tsx',
  'src/app/slownik-naklejek/page.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Fix brand
  content = content.replace(
    /brand: \{ "@id": "https:\/\/www\.malenaklejki\.pl\/#organization" \}/g,
    'brand: { "@type": "Brand", name: "MałeNaklejki" }'
  );

  // Fix offers (add missing fields)
  // We need to inject `validFrom`, `hasMerchantReturnPolicy`, `shippingDetails` into `offers: { ... }`
  
  // Find `offers: {` and replace it
  const replacement = `offers: {
            "@type": "Offer",
            validFrom: "2024-01-01T00:00:00Z",
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "PL",
              returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
              description: "Zwrot produktów personalizowanych nie jest możliwy z uwagi na ich unikalny charakter."
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "15.00",
                currency: "PLN"
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "PL"
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 1,
                  maxValue: 3,
                  unitCode: "d"
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 1,
                  maxValue: 2,
                  unitCode: "d"
                }
              }
            },`;

  content = content.replace(/offers: \{\s*"@type": "Offer",/g, replacement);

  fs.writeFileSync(f, content, 'utf8');
  console.log(`Updated ${f}`);
});
