//visual objects
function createBackground(images, name){
  return {
    category: 'background',
    img: images[name],
    x: 0,
    y: 0
  };
}

function createRamp(images){
  return {
    category: 'ramp',
    img: images['ramp'],
    x: 150,
    y: 400,
  };
}

function createProduct(name, img){
  return {
    category: 'product',
    img: img,
    name: name,
    x: 0,
    y: 600,
    parent: null,
    md: onProductMouseDown,
    mu: onProductMouseUp,
  };
}

function createSlot(owner, width, height, images) {
  return {
    category: 'slot',
    parent: owner,
    item: null,
    img: images['details'],
    x: 0,
    y: 0,
    w: width,
    h: height,
  };
}

function createPallet(images) {
  const pallet = {
    category: 'pallet',
    img: images['pallet'],
    x: 0,
    y: 600,
    slots: [],
    setSlotPosition: null,
    state: null,
    isItemOnTop: null,
    getEmptyBottomSlot: null
  };

  for (let i = 0; i < 20; i++) {
    pallet.slots[pallet.slots.length] = createSlot(pallet, 50, 50, images);
  }

  pallet.setSlotPosition = () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 5; j++) {
        pallet.slots[i*5+j].x = (pallet.x + 10) + j * pallet.slots[i*5+j].w;
        pallet.slots[i*5+j].y = (pallet.y - 50) - i * pallet.slots[i*5+j].h;

        if (pallet.slots[i*5+j].item) {
          pallet.slots[i*5+j].item.x = pallet.slots[i*5+j].x;
          pallet.slots[i*5+j].item.y = pallet.slots[i*5+j].y;

          if (pallet.slots[i*5+j].item.setSlotPosition) {
            pallet.slots[i*5+j].item.setSlotPosition();
          }
        }
      }
    }
  }

  pallet.isItemOnTop = (item) => {
    const index = pallet.slots.findIndex(el => el.item === item);
    const row = 5;

    if (index >= 0 && (index >= pallet.slots.length - row || !pallet.slots[index + row].item)) {
      return true;
    }

    return false;
  }

  pallet.getEmptyBottomSlot = (slot) => {
    const index = pallet.slots.findIndex(el => el === slot);
    const row = 5;

    if (index - row >= 0 && !pallet.slots[index - row].item) {
      return pallet.getEmptyBottomSlot(pallet.slots[index - row]);
    }

    return slot;
  }

  pallet.setSlotPosition();
  return pallet;
}

function createCar(images, name, productAvailability) {
  const img = images[name];

  const car = {
    category: 'car',
    img: img,
    x: -820,
    y: 250,
    w: img.width,
    h: img.height,
    productAvailability,
    slots: [],
    setSlotPosition: null,
  };

  for (let i = 0; i < 4; i++) {
    car.slots[car.slots.length] = createSlot(car, 270, 25, images);
  }

  car.setSlotPosition = () => {
    for (let i = 0; i < car.slots.length; i++) {
      car.slots[i].x = car.x + 295 + (i * 60);
      car.slots[i].y = car.y + 245;

      if (car.slots[i].item) {
        car.slots[i].item.x = car.slots[i].x;
        car.slots[i].item.y = car.slots[i].y;

        if (car.slots[i].item.setSlotPosition) {
          car.slots[i].item.setSlotPosition();
        }
      }
    }
  }

  car.setSlotPosition();
  return car;
}

function createRollcage(images) {
  const rollcage = {
    category: 'rollcage',
    img: images['rollcage'],
    x: 900,
    y: 260,
    slots: [],
    setSlotPosition: null,
    isItemOnTop: null,
    getEmptyBottomSlot: null,
  };

  for (let i = 0; i < 8; i++) {
    rollcage.slots[rollcage.slots.length] = createSlot(rollcage, 50, 50, images);
  }

  rollcage.setSlotPosition = () => {
    let hspace = 0;

    for (let h = 0; h < 4; h++) {
      for (let w = 0; w < 2; w++) {
        rollcage.slots[h*2+w].x = (rollcage.x + 5) + w * rollcage.slots[h*2+w].w;
        rollcage.slots[h*2+w].y = (rollcage.y + 188) - h * rollcage.slots[h*2+w].h - hspace;

        if (rollcage.slots[h*2+w].item) {
          rollcage.slots[h*2+w].item.x = rollcage.slots[h*2+w].x;
          rollcage.slots[h*2+w].item.y = rollcage.slots[h*2+w].y;

          if (rollcage.slots[h*2+w].item.setSlotPosition) {
            rollcage.slots[h*2+w].item.setSlotPosition();
          }
        }
      }

      if (h == 1) {
        hspace = 26;
      }
    }
  }

  rollcage.isItemOnTop = (item) => {
    const index = rollcage.slots.findIndex(el => el.item === item);
    const row = 2;

    if (index >= 0 && ((index == 2 || index == 3 || index == 6 || index == 7) || !rollcage.slots[index + row].item)) {
      return true;
    }

    return false;
  }

  rollcage.getEmptyBottomSlot = (slot) => {
    const index = rollcage.slots.findIndex(el => el === slot);
    const row = 2;

    if ((index == 2 || index == 3 || index == 6 || index == 7) && !rollcage.slots[index - row].item) {
      return rollcage.getEmptyBottomSlot(rollcage.slots[index - row]);
    }

    return slot;
  }

  rollcage.setSlotPosition();
  return rollcage;
}

function createPalletJack(images) {
  const img = images['pallet_jack'];

  const palletJack = {
    category: 'pallet_jack',
    img: img,
    x: 900,
    y: 395,
    w: img.width,
    h: img.height,
    slot: null,
    setSlotPosition: null,
  };

  palletJack.slot = createSlot(palletJack, 270, 25, images);

  palletJack.setSlotPosition = () => {
    palletJack.slot.x = palletJack.x - 60;
    palletJack.slot.y = palletJack.y + 100;

    if (palletJack.slot.item) {
      palletJack.slot.item.x = palletJack.slot.x;
      palletJack.slot.item.y = palletJack.slot.y;

      if (palletJack.slot.item.setSlotPosition) {
        palletJack.slot.item.setSlotPosition();
      }
    }
  }

  palletJack.setSlotPosition();
  return palletJack;
}

function createInvoice(images, order) {
  const invoice = {
    category: 'invoice',
    img: images['invoice'],
    x: 0,
    y: 600,
    stamp: null,
    shortage: null,
    grid: null,
    setSlotPosition: null,
    order,
  };

  invoice.grid = createInvoiceGrid(invoice);

  invoice.stamp = {
    category: 'stamp',
    parent: invoice,
    img: images['invoice_stamp_1'],
    x: 0,
    y: 600,
    mc: onInvoiceStampMouseClick,
  };

  invoice.shortage = {
    category: 'shortage',
    parent: invoice,
    img: images['invoice_shortage_1'],
    x: 0,
    y: 600,
    isActive: false,
    mc: onInvoiceShortageMouseClick,
  };

  invoice.setSlotPosition = () => {
    invoice.stamp.x = invoice.x + 120;
    invoice.stamp.y = invoice.y + 220;
    invoice.grid.x = invoice.x + 10;
    invoice.grid.y = invoice.y + 30;
    invoice.shortage.x = invoice.x + 20;
    invoice.shortage.y = invoice.y + 220;
  }

  invoice.setSlotPosition();
  return invoice;
}

function createInvoiceGrid(invoice) {
  const grid = {
    category: 'grid',
    parent: invoice,
    img: null,
    x: 0,
    y: 600,
  };

  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 275;

  const ctx = canvas.getContext("2d");
  ctx.font = "14px Roboto";
  ctx.textBaseline = "top";
  ctx.strokeRect(0, 0, 180, 20 * invoice.order.length);
  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(150, 20 * invoice.order.length);
  ctx.stroke();

  for (let i = 0; i < invoice.order.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 20 * i);
    ctx.lineTo(180, 20 * i);
    ctx.stroke();
    ctx.fillText(invoice.order[i].name, 3, 20 * i + 2);
    ctx.fillText(invoice.order[i].number, 153, 20 * i + 2);
  }

  grid.img = canvas;
  return grid;
}

function createTable(images) {
  const table = {
    category: 'table',
    img: images['table'],
    x: 475,
    y: 450,
    slots: [],
    setSlotPosition: null,
    isItemOnTop: null,
    getEmptyBottomSlot: null,
  };

  for (let i = 0; i < 6; i++) {
    table.slots[table.slots.length] = createSlot(table, 50, 50, images);
  }

  table.setSlotPosition = () => {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        table.slots[i*3+j].x = table.x + (j * table.slots[i*3+j].w);
        table.slots[i*3+j].y = table.y - ((i + 1) * table.slots[i*3+j].h);

        if (table.slots[i*3+j].item) {
          table.slots[i*3+j].item.x = table.slots[i*3+j].x;
          table.slots[i*3+j].item.y = table.slots[i*3+j].y;

          if (table.slots[i*3+j].item.setSlotPosition) {
            table.slots[i*3+j].item.setSlotPosition();
          }
        }
      }
    }
  }

  table.isItemOnTop = (item) => {
    const index = table.slots.findIndex(slot => slot.item === item);
    const row = 3;

    if (index >= 0 && (index >= table.slots.length - row || !table.slots[index + row].item)) {
      return true;
    }

    return false;
  }

  table.getEmptyBottomSlot = (slot) => {
    const index = table.slots.findIndex(el => el === slot);
    const row = 3;

    if (!slot.item && (index == 3 || index == 4 || index == 5) && !table.slots[index - row].item) {
      return table.getEmptyBottomSlot(table.slots[index - row]);
    }

    return slot;
  }

  table.setSlotPosition();
  return table;
}

function createShortage(id, img, img_stp) {
  const sa = {
    category: 'shortage',
    id: id,
    img: img,
    x: 400,
    y: 5,
    stamp: null,
  };

  sa.setDetailsPosition = function () {
    this.stamp.x = this.x + 120;
    this.stamp.y = this.y + 220;
  }

  sa.stamp = { category: 'stamp', belongs: sa, id: 'shortage_stamp', img: img_stp, x: 0, y: 600 };
  return sa;
}

function createTimer() {
  const t = { start: null, end: null, is_run: false };

  t.getTime = function () {
    if (this.is_run) {
      this.end = Date.now();
    }

    const date = new Date(this.end - this.start);
    const iso = date.toISOString().substring(14, 19);
    return iso;
  }

  t.setRun = function () {
    this.start = Date.now();
    this.is_run = true;
  }

  t.setStop = function () {
    this.end = Date.now();
    this.is_run = false;
  }

  t.setReset = function () {
    this.start = this.end = Date.now();
  }

  t.setReset();
  return t;
}