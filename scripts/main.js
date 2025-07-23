const SOCKET_SHOW = false;
const FPS = 60;

window.onload = async function () {
  const canvas = document.getElementById("canvas");

  if (!canvas.getContext) {
    alert("Canvas context error");
    return;
  }

  const ctx = canvas.getContext("2d");
  ctx.data = {
    visualObjects: [],
    activeObjects: {},
    overlays: [],
    storage: [],
    timer: null,
    score: 0,
    isStarted: false,
  }

  function redraw() {
    draw(ctx);
    requestAnimationFrame(redraw);
  }

  requestAnimationFrame(redraw);
  await loadScripts();
  ctx.data.images = await loadImages();
  initMainMenu(ctx);
}

function draw(ctx) {
  const visualObjects = ctx.data.visualObjects;
  const overlays = ctx.data.overlays;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < visualObjects.length; i++) {
    const vo = visualObjects[i];

    if (vo.category == 'detail') {
      if (SOCKET_SHOW) {
        ctx.drawImage(vo.img, vo.x, vo.y, vo.w, vo.h);
      }
    } else {
      ctx.drawImage(vo.img, vo.x, vo.y);
    }
  }

  for (let i = 0; i < overlays.length; i++) {
    ctx.drawImage(overlays[i].img, overlays[i].x, overlays[i].y);
  }

  if (ctx.data.timer) {
    ctx.save();
    ctx.font = "24px Roboto";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000000";
    ctx.fillText(ctx.data.timer.getTime(), 830, 10);
    ctx.restore();
  }

  if (ctx.data.isStarted) {
    ctx.save();
    ctx.font = "24px Roboto";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000000";
    ctx.fillText('ЗП: ' +  ctx.data.score, 10, 10);
    ctx.restore();
  }
}

function loadScriptAsync(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;

    script.onload = () => resolve(src);
    script.onerror = () => reject(new Error(`Loading failed ${src}`));

    document.head.appendChild(script);
  });
}

async function loadScripts() {
  const scripts = [
    'scripts/orders.js',
    'scripts/objects.js',
    'scripts/events.js',
  ];

  for (const src of scripts) {
    try {
      await loadScriptAsync(src);
    } catch (err) {
      console.error(err);
      return;
    }
  }
}

function loadImageAsync(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Loading failed ${src}`));
  });
}

async function loadImages() {
  const imageSrc = {
    //decoration
    bg_start: 'img/bg_start.png',
    background: 'img/bg_oty.png',
    ramp: 'img/ramp.png',
    table: 'img/table.png',
    //moving
    pallet: 'img/pallet.png',
    car_red: 'img/car_red.png',
    car_blue: 'img/car_blue.png',
    rollcage: 'img/rollcage.png',
    invoice: 'img/invoice.png',
    pallet_jack: 'img/pallet_jack.png',
    worker: 'img/worker.png',
    //productses
    vinegar: 'img/vinegar.png',
    wine_red: 'img/wine_red.png',
    buckwheat: 'img/buckwheat.png',
    canned_food: 'img/canned_food.png',
    chips: 'img/chips.png',
    coffe: 'img/coffe.png',
    oil: 'img/oil.png',
    shampoo: 'img/shampoo.png',
    vodka: 'img/vodka.png',
    //other
    alpha: 'img/alpha.png',
    invoice_check_1: 'img/invoice_check_1.png',
    invoice_check_2: 'img/invoice_check_2.png',
    invoice_check_3: 'img/invoice_check_3.png',
    invoice_stamp_1: 'img/invoice_stamp_1.png',
    invoice_stamp_2: 'img/invoice_stamp_2.png',
    invoice_shortage_1: 'img/invoice_shortage_1.png',
    invoice_shortage_2: 'img/invoice_shortage_2.png',
    invoice_row: 'img/invoice_row.png',
    invoice_row_enter: 'img/invoice_row_enter.png',
    invoice_row_click: 'img/invoice_row_click.png',
    details: 'img/details.png',
    button_play: 'img/button_play.png',
    button_play_2: 'img/button_play_2.png',
    arrow_left: 'img/arrow_left.png',
    arrow_right: 'img/arrow_right.png',
    window_modal: 'img/window_modal.png',
    window_grid: 'img/window_modal_grid.png',
  };

  let images = {};

  for (const key in imageSrc) {
    try {
      const image = await loadImageAsync(imageSrc[key]);
      images[key] = image;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  return images;
}

function initMainMenu(ctx) {
  const canvas = ctx.canvas;
  canvas.addEventListener("mousemove", (e) => onMouseMove(e, ctx), false);
  canvas.addEventListener("mousedown", (e) => onMouseDown(e, ctx), false);
  canvas.addEventListener("mouseup", (e) => onMouseUp(e, ctx), false);

  const vo = ctx.data.visualObjects;
  const images = ctx.data.images;
  vo[vo.length] = createBackground(images, 'bg_start');
  vo[vo.length] = {
    img: images['button_play'],
    x: canvas.width / 2 - images['button_play'].width / 2,
    y: canvas.height / 2 - images['button_play'].height / 2,
    md: false,
    mu: false,
    me: onPlayButtonMouseEnter,
    ml: onPlayButtonMouseLeave,
    mc: onPlayButtonMouseClick,
  };
}

function initOTY(ctx) {
  const images = ctx.data.images;
  const vo = ctx.data.visualObjects;
  const ao = ctx.data.activeObjects;

  ctx.data.timer = createTimer();
  const background = createBackground(images, 'background');
  const palletJack = createPalletJack(images);
  const rollcage = createRollcage(images);
  const ramp = createRamp(images);
  const table = createTable(images);

  vo[vo.length] = background;
  vo[vo.length] = table;
  vo[vo.length] = palletJack;
  vo[vo.length] = rollcage;
  vo[vo.length] = ramp;

  ao['pallet_jack'] = palletJack;
  ao['rollcage'] = rollcage;
  ao['table'] = table;

  startRound(ctx);
}

async function startRound(ctx) {
  const images = ctx.data.images;
  const vo = ctx.data.visualObjects;
  const ao = ctx.data.activeObjects;

  ctx.data.storage = [];
  const priceList = createPriceList(images);
  const order = createProductOrder(priceList);
  const products = createProducts(order, images);
  const invoice = createInvoice(images, order);

  const pallets = [];
  const palletNumber = Math.ceil(products.length / 20);

  for (let i = 0; i < palletNumber; i++) {
    pallets[i] = createPallet(images);
  }

  const carName = random(0, 1) ? 'car_blue' : 'car_red';
  const productAvailability = reInventory(products);
  const car = createCar(images, carName, productAvailability);

  vo[vo.length] = invoice;
  vo[vo.length] = invoice.grid;
  vo[vo.length] = invoice.stamp;
  vo[vo.length] = invoice.shortage;

  for (const item of products) {
    vo[vo.length] = item;
  }

  setVisualObjectToFront(vo, "rollcage");
  setVisualObjectToFront(vo, "pallet_jack");

  for (const item of pallets) {
    vo[vo.length] = item;
  }

  vo[vo.length] = car;
  setVisualObjectToFront(vo, "ramp");

  ao['car'] = car;
  ao['invoice'] = invoice;
  ao['pallets'] = pallets;
  ao['products'] = products;

  inputProductsInPallets(products, pallets);
  inputPalletsInCar(pallets, car);

  await createAnimateAsync(car, -820, 0, -650, 0, 2000);
  let carSlot = null;

  for (const slot of car.slots) {
    if (slot.item) {
      carSlot = slot;
      break;
    }
  }

  if (!carSlot) {
    alert('Empty car');
    return;
  }

  const palletJack = ao['pallet_jack'];
  await createAnimateAsync(palletJack, 900, 0, carSlot.x + 60, 0, 2000);
  palletJack.slot.item = carSlot.item;
  carSlot.item = null;

  const palletJackTask = async () => {
    await createAnimateAsync(palletJack, palletJack.x, 0, 210, 0, 2000);
    palletJack.slot.item.state = 'ramp';
  }

  const rollcageTask = async () => {
    const rollcage = ao['rollcage'];
    await createAnimateAsync(rollcage, 900, 0, 650, 0, 2000);
  }

  const invoiceTask = async () => {
    const invoice = ao['invoice'];
    await createAnimateAsync(invoice, 0, -280, 150, 5, 2000);
  }

  await Promise.all([palletJackTask(), rollcageTask(), invoiceTask()]);
  ctx.data.timer.setRun();
}

function setVisualObjectToFront(vo, name) {
  const index = vo.findIndex(el => el.category == name);

  if (index >= 0) {
    const value = vo[index];
    vo.splice(index, 1);
    vo.push(value);
  }
}

function createPriceList(images) {
  return [
    { category:'product', id:'vinegar', name:'Уксус', img:images['vinegar'] },
    { category:'product', id:'wine_red', name:'Красное вино', img:images['wine_red'] },
    { category:'product', id:'buckwheat', name:'Гречка', img:images['buckwheat'] },
    { category:'product', id:'canned_food', name:'Консервы', img:images['canned_food'] },
    { category:'product', id:'chips', name:'Чипсы', img:images['chips'] },
    { category:'product', id:'coffe', name:'Кофе', img:images['coffe'] },
    { category:'product', id:'oil', name:'Подсолнечное масло', img:images['oil'] },
    { category:'product', id:'shampoo', name:'Шампунь', img:images['shampoo'] },
    { category:'product', id:'vodka', name:'Водка', img:images['vodka'] },
  ];
}

function inputProductsInPallets(products, pallets) {
  let inserted = false;

  for (const product of products) {
    inserted = false;

    for (const pallet of pallets) {
      for (const slot of pallet.slots) {
        if (!slot.item) {
          product.parent = slot;
          slot.item = product;
          inserted = true;
          break;
        }
      }

      if (inserted) break;
    }
  }
}

function inputPalletsInCar(pallets, car){
  for (let i = 0; i < pallets.length; i++) {
    pallets[i].state = 'car';
    car.slots[i].item = pallets[i];
  }
}

function isAllSlotsEmpty(obj) {
  for (const slot of obj.slots) {
    if (slot.item) {
      return false;
    }
  }

  return true;
}

function hasEmptySlot(obj) {
  for (const slot of obj.slots) {
    if (!slot.item) {
      return true;
    }
  }

  return false;
}


async function checkNextPallet(pallet, ctx) {
  const ao = ctx.data.activeObjects;
  const car = ao['car'];
  const palletJack = ao['pallet_jack'];

  if (!isAllSlotsEmpty(pallet) || isAllSlotsEmpty(car)) return;

  await createAnimateAsync(palletJack, palletJack.x, 0, 1000, 0, 2000);

  pallet.state = 'storage';
  palletJack.slot.item = null;

  let carSlot = null;

  for (const slot of car.slots) {
    if (slot.item) {
      carSlot = slot;
      break;
    }
  }

  await createAnimateAsync(palletJack, 900, 0, carSlot.x + 60, 0, 2000);

  palletJack.slot.item = carSlot.item;
  carSlot.item = null;
  await createAnimateAsync(palletJack, palletJack.x, 0, 210, 0, 2000);
  palletJack.slot.item.state = 'ramp';
}

async function checkFullRollcage(rollcage, ctx) {
  if (hasEmptySlot(rollcage)) return;

  const storage = ctx.data.storage;
  await createAnimateAsync(rollcage, rollcage.x, 0, 900, 0, 2000);

  for (const slot of rollcage.slots) {
    if (slot.item) {
      storage[storage.length] = slot.item;
      slot.item = null;
    }
  }

  await createAnimateAsync(rollcage, 900, 0, 650, 0, 2000);
}

function reInventory(storage) {
  const report = [];
  let isSame = false;

  for (let i = 0; i < storage.length; i++) {
    isSame = false;

    for (let j = 0; j < report.length; j++) {
      if (report[j].name == storage[i].name) {
        report[j].number++;
        isSame = true;
        break;
      }
    }

    if (!isSame) {
      report[report.length] = { name: storage[i].name, number: 1 };
    }
  }

  return report;
}

function validateShortage(order, report) {
  let shortage = [];
  let isUnavailable;
  let number;
  let total = 0;

  for (const orderProduct of order) {
    isUnavailable = true;
    number = orderProduct.number;

    for (const reportProduct of report) {
      if (orderProduct.name === reportProduct.name) {
        if (orderProduct.number === reportProduct.number) {
          isUnavailable = false;
        } else {
          number = orderProduct.number - reportProduct.number;
        }

        break;
      }
    }

    if (isUnavailable) shortage[shortage.length] = { name: orderProduct.name, number };
  }

  for (const product of shortage) {
    total += product.number;
  }

  return { total, details: shortage };
}

async function createAnimateAsync(obj, s_x, s_y, f_x, f_y, t) {
  const fx = f_x;
  const fy = f_y;
  const frameTime = 1000 / FPS;
  const totalFrames = Math.round(t / frameTime);
  let currentFrame = 0;

  const speed_x = (f_x - s_x) / totalFrames;
  const speed_y = (f_y - s_y) / totalFrames;

  if (speed_x != 0) obj.x = s_x;
  if (speed_y != 0) obj.y = s_y;

  return new Promise((resolve) => {
    let lastTime = null;
  
    function animate(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;

      if (delta >= frameTime) {
        obj.x += speed_x;
        obj.y += speed_y;

        if (obj.sockets) {
          obj.setSocketsPosition();
        } else if (obj.setSlotPosition) {
          obj.setSlotPosition();
        }

        currentFrame++;
        lastTime = timestamp;
      }

      const doneX =
        (speed_x > 0 && obj.x >= fx) ||
        (speed_x < 0 && obj.x <= fx) ||
        speed_x === 0;

      const doneY =
        (speed_y > 0 && obj.y >= fy) ||
        (speed_y < 0 && obj.y <= fy) ||
        speed_y === 0;

      if (doneX && doneY) {
        resolve(obj);
      } else {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  });
}