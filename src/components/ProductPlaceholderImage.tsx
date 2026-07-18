import React from 'react';

interface PlaceholderProps {
  image: string;
  name: string;
  category: string;
  className?: string;
}

const getUnsplashUrlForProduct = (name: string, category: string): string => {
  const normName = name.toLowerCase();
  const normCat = category.toLowerCase();

  // Specific high-quality Unsplash images for common product names/keywords:
  if (normName.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('potato')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('onion')) {
    return 'https://images.unsplash.com/photo-1618519764620-7403abdbfee9?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('banana')) {
    return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('apple')) {
    return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('milk') || normName.includes('dairy')) {
    return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('butter')) {
    return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('paneer') || normName.includes('cottage cheese') || normName.includes('ghee')) {
    return 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('egg')) {
    return 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('rice') || normName.includes('basmati')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('bread') || normName.includes('toast') || normName.includes('buns') || normName.includes('bakery')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('atta') || normName.includes('flour') || normName.includes('besan') || normName.includes('suji') || normName.includes('rava')) {
    return 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('tea') || normName.includes('chai') || normName.includes('lipton') || normName.includes('red label')) {
    return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('coffee') || normName.includes('nescafe')) {
    return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('biscuit') || normName.includes('cookie') || normName.includes('bourbon') || normName.includes('cracker') || normName.includes('dark fantasy')) {
    return 'https://images.unsplash.com/photo-1558961309-dbdf050d1213?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('makhana') || normName.includes('fox nuts') || normName.includes('dry fruit') || normName.includes('almond') || normName.includes('kaju') || normName.includes('cashew') || normName.includes('raisin') || normName.includes('pista')) {
    return 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('dal') || normName.includes('lentils') || normName.includes('pulses') || normName.includes('chana') || normName.includes('rajma') || normName.includes('urad') || normName.includes('moong')) {
    return 'https://images.unsplash.com/photo-1547058886-f4955c421715?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('oil') || normName.includes('mustard oil') || normName.includes('soyabean oil')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('salt') || normName.includes('sugar')) {
    return 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('broom') || normName.includes('wiper') || normName.includes('bucket') || normName.includes('detergent') || normName.includes('phenyl') || normName.includes('supplies') || normName.includes('dishwash') || normName.includes('jhadu') || normName.includes('drain')) {
    return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('brush') || normName.includes('soap') || normName.includes('toothpaste') || normName.includes('shampoo') || normName.includes('care') || normName.includes('handwash') || normName.includes('toothbrush')) {
    return 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('pet') || normName.includes('cat') || normName.includes('kitten') || normName.includes('dog') || normName.includes('whiskas') || normName.includes('drools') || normName.includes('purepet')) {
    return 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('teddy') || normName.includes('toy') || normName.includes('game') || normName.includes('car') || normName.includes('racket') || normName.includes('board') || normName.includes('gun') || normName.includes('doll') || normName.includes('play')) {
    return 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('beverage') || normName.includes('soda') || normName.includes('cola') || normName.includes('sprite') || normName.includes('drink') || normName.includes('campa') || normName.includes('orange') || normName.includes('limca')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('tiffin') || normName.includes('lunch') || normName.includes('bottle') || normName.includes('jug') || normName.includes('flask') || normName.includes('kettle')) {
    return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('spices') || normName.includes('masala') || normName.includes('jeera') || normName.includes('mirch') || normName.includes('methi') || normName.includes('cumin') || normName.includes('turmeric') || normName.includes('coriander') || normName.includes('chilli') || normName.includes('garam')) {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60';
  }
  if (normName.includes('chips') || normName.includes('crisps') || normName.includes('chocolate') || normName.includes('snack') || normName.includes('sweets') || normName.includes('cream')) {
    return 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=500&auto=format&fit=crop&q=60';
  }

  // Category based Unsplash fallbacks
  switch (normCat) {
    case 'fruits & vegetables':
      return 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=60';
    case 'dairy & eggs':
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60';
    case 'pantry & staples':
      return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60';
    case 'bakery & bread':
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60';
    case 'beverages':
      return 'https://images.unsplash.com/photo-1527960656306-ff37c2819297?w=500&auto=format&fit=crop&q=60';
    case 'snacks & sweets':
      return 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=500&auto=format&fit=crop&q=60';
    case 'household supplies':
      return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60';
    case 'personal care':
      return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60';
    case 'pet care':
      return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=60';
    case 'toys & games':
      return 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=500&auto=format&fit=crop&q=60';
    case 'apparel & innerwear':
      return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60';
    default:
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
  }
};

export default function ProductPlaceholderImage({ image, name, category, className = "w-full h-full" }: PlaceholderProps) {
  const isRealImage = image && (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/'));
  const imgSrc = isRealImage ? image : getUnsplashUrlForProduct(name, category);

  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden select-none ${className}`} 
      id={`placeholder-wrapper-${name.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <img
        src={imgSrc}
        alt={name}
        className="w-full h-full object-cover rounded-md"
        referrerPolicy="no-referrer"
        id={`product-image-${name.replace(/\s+/g, '-').toLowerCase()}`}
        loading="lazy"
      />
    </div>
  );
}
