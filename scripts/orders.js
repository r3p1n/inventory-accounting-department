const PRODUCT_MAX_NUMBER = 50;

function createProductOrder(productList) {
  let order = [];
  const n = random(2, PRODUCT_MAX_NUMBER);
  let product_exist;
  
  for (let i = 0; i < n; i++) {
    product_exist = false;
    const p = random(0, productList.length - 1);

    for (let j = 0; j < order.length; j++) {
      if (productList[p].id == order[j].id) {
        order[j].number += 1;
        product_exist = true;
        break;
      }
    }

    if (!product_exist) {
      order[order.length] = {
        id: productList[p].id,
        name: productList[p].name,
        number: 1,
      };
    }
  }

  return order;
}

function createProducts(order, imgs) {
  let products = [];

  for (let i = 0; i < order.length; i++) {
    for (let j = 0; j < order[i].number; j++) {
      products[products.length] = createProduct(order[i].name, imgs[order[i].id]);
    }
  }

  switch (random(1, 3)) {
    // less order
    case 1: {
      products.splice(random(0, products.length - 1), 1);
      break;
    }
    // more order
    case 2:{
      const p = products[random(0, products.length - 1)];
      products[products.length] = createProduct(p.name, p.img);
    }
    case 3: break;
  }

  return shuffle(products);
}

function random(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  let currentIndex = array.length;

  while (0 !== currentIndex) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    const temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}