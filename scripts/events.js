const MOUSE_DEVIATION = 10;

function onMouseDown(e, ctx) {
  const visualObjects = ctx.data.visualObjects;

  for (let i = visualObjects.length - 1; i >= 0 ; i--) {
    const vo = visualObjects[i];

    if (vo.md && checkMouseEvent(e, ctx, vo)) {
      vo.md(e, vo, ctx);
    }
    if (vo.mc && checkMouseEvent(e, ctx, vo)) {
      vo.mcx = e.pageX;
      vo.mcy = e.pageY;
    }
  }
}

function onMouseUp(e, ctx) {
  const visualObjects = ctx.data.visualObjects;

  for (let i = visualObjects.length - 1; i >= 0 ; i--) {
    const vo = visualObjects[i];

    if (vo.mu && checkMouseEvent(e, ctx, vo)) {
        vo.mu(e, vo, ctx);
    }

    if (vo.mc) {
      const flag = (vo.mcx - e.pageX <= MOUSE_DEVIATION && vo.mcx - e.pageX >= -MOUSE_DEVIATION)
        && (vo.mcy - e.pageY <= MOUSE_DEVIATION && vo.mcy - e.pageY >= -MOUSE_DEVIATION);

      if (flag) {
        delete vo.mcx;
        delete vo.mcy;
        vo.mc(e, vo, ctx);
      }
    }
  }
}

function onMouseMove(e, ctx) {
  const visualObjects = ctx.data.visualObjects;

  for (let i = visualObjects.length - 1; i >= 0 ; i--) {
    const vo = visualObjects[i];

    if (vo.me && checkMouseEvent(e, ctx, vo)) {
      vo.me(e, vo, ctx);
    }

    if (vo.ml && !checkMouseEvent(e, ctx, vo)) {
      vo.ml(e, vo, ctx);
    }
  }
}

function checkMouseEvent(e, ctx, vo) {
  const x1 = e.pageX,
    y1 = e.pageY,
    x2 = ctx.canvas.offsetLeft + vo.x,
    y2 = ctx.canvas.offsetTop + vo.y,
    w = vo.img.width,
    h = vo.img.height;

  return x1 > x2 && x1 < x2 + w && y1 > y2 && y1 < y2 + h;
}

function onPlayButtonMouseEnter(_e, vo, ctx){
  if (!vo.mouse_enter) {
    vo.mouse_enter = true;
    vo.img = ctx.data.images['button_play_2'];
  }
}

function onPlayButtonMouseLeave(_e, vo, ctx) {
  if (vo.mouse_enter) {
    vo.mouse_enter = false;
    vo.img = ctx.data.images['button_play'];
  }
}

function onPlayButtonMouseClick(_e, _vo, ctx) {
  ctx.data.visualObjects = [];
  ctx.data.isStarted = true;
  initOTY(ctx);
}

function onProductMouseDown(_e, product, ctx) {
  const slot = product.parent;
  const owner = slot.parent;

  if (owner.isItemOnTop(product)) {
    slot.item = null;
    product.me = onProductMouseEnter;
    product.ml = onProductMouseEnter;

    const overlays = ctx.data.overlays;
    overlays[overlays.length] = product;
  }
}

function onProductMouseUp(e, product, ctx) {
  const overlays = ctx.data.overlays;
  let newSlot = null;

  for (const vo of ctx.data.visualObjects) {
    if (vo.slots) {
      const slot = vo.slots.find(el => checkMouseEvent(e, ctx, el));

      if (slot && !slot.item) {
        const owner = slot.parent;
        newSlot = owner.getEmptyBottomSlot(slot);
        break;
      }
    }
  }

  if (newSlot) {
    const oldProductOwner = product.parent.parent;
    product.parent.item = null;
    newSlot.item = product;
    product.parent = newSlot;
    const newProcuctOwner = newSlot.parent;

    if (oldProductOwner.category === 'pallet') {
      checkNextPallet(oldProductOwner, ctx);
    }

    if (newProcuctOwner.category === 'rollcage') {
      checkFullRollcage(newProcuctOwner, ctx);
    }
  } else {
    newSlot = product.parent;
    newSlot.item = product;
  }

  product.me = null;
  product.ml = null;
  product.x = newSlot.x;
  product.y = newSlot.y;

  for (let i = 0; i < overlays.length; i++) {
    if (overlays[i] == product) {
      overlays.splice(i, 1);
    }
  }
}

function onProductMouseEnter(e, product, ctx) {
  product.x = e.pageX - ctx.canvas.offsetLeft - product.img.width / 2;
  product.y = e.pageY - ctx.canvas.offsetTop - product.img.height / 2;
}

async function onInvoiceStampMouseClick(_e, obj, ctx) {
  const images = ctx.data.images;
  if (obj.img == images['invoice_stamp_2']) return;

  const ao = ctx.data.activeObjects;
  const storage = ctx.data.storage;
  const invoice = ao['invoice'];
  const car = ao['car'];

  obj.img = images['invoice_stamp_2'];
  ctx.data.timer.setStop();

  const rollcageTask = async () => {
    const rollcage = ao['rollcage'];
    await createAnimateAsync(rollcage, rollcage.x, 0, 900, 0, 2000);

    for (const slot of rollcage.slots) {
      if (slot.item) {
        storage[storage.length] = slot.item;
        slot.item = null;
      }
    }
  }

  const palletJackTask = async () => {
    const palletJack = ao['pallet_jack'];
    const finishX = (car.x + car.w) - (palletJack.x + palletJack.w + 10);
    await createAnimateAsync(palletJack, palletJack.x, 0, finishX, 0, 2000);

    let carSlot = null;

    for (const slot of car.slots) {
      if (!slot.item) {
        carSlot = slot;
        break;
      }
    }

    carSlot.item = palletJack.slot.item;
    palletJack.slot.item = null;
    await createAnimateAsync(palletJack, palletJack.x, 0, 900, 0, 2000);
    await createAnimateAsync(car, car.x, 0, -820, 0, 2000);
  }

  const invoiceTask = async () => {
    await createAnimateAsync(invoice, 150, 5, 0, -280, 2000);
  }

  await Promise.all([rollcageTask(), palletJackTask(), invoiceTask()]);

  /* TODO:
    - surplus of products
  */

  const report = reInventory(storage);
  const storageShortage = validateShortage(invoice.order, report);
  const carShortage = validateShortage(invoice.order, car.productAvailability);
  const fine = 3;

  if (invoice.shortage.isActive) {
    if (carShortage.total) {
      if (carShortage.total >= storageShortage.total) {
        ctx.data.score += invoice.order.length * 100;
      } else {
        ctx.data.score -= (storageShortage.total - carShortage.total) * 100;
        console.log("Недостача на складе больше чем по факту");
      }
    } else {
      if (storageShortage.total) {
        ctx.data.score -= (storageShortage.total + fine) * 100;
        console.log("Недостача на складе + ошибка в накладной о недостачи");
      } else {
        ctx.data.score -= fine * 100;
        console.log("Ошибка в накладной о недостачи");
      }
    }
  } else {
    if (carShortage.total) {
      if (carShortage.total >= storageShortage.total) {
        ctx.data.score -= fine * 100;
        console.log("Ошибка в накладной о недостачи");
      } else {
        ctx.data.score -= (storageShortage.total + fine) * 100;
        console.log("Недостача на складе больше чем по факту + ошибка в накладной о недостачи");
      }
    } else {
      if (storageShortage.total) {
        ctx.data.score -= storageShortage.total * 100;
        console.log("Недостача на складе");
      } else {
        ctx.data.score += invoice.order.length * 100;
      }
    }
  }

  startRound(ctx);
}

function onInvoiceShortageMouseClick(_e, obj, ctx) {
  const images = ctx.data.images;

  obj.isActive = !obj.isActive;
  obj.img = obj.isActive ? images['invoice_shortage_2'] : images['invoice_shortage_1'];
}

function onInvoiceRowMouseClick(_e, obj, ctx) {
  const vo = ctx.data.visualObjects;
  const ao = ctx.data.activeObjects;
  const images = ctx.data.images;

  if (ao['shortage']) {
    obj.img = images['invoice_row_click'];
    const invoice = obj.belongs;

    for (const item of invoice.rows) {
      item.mc = null;
      item.me = null;
      item.ml = null;
    }

    const windowGrid = createWindowGrid('window_grid', images['window_grid']);
    vo[vo.length] = windowGrid;

    const windowModal = createWindowModal('window_modal', images['window_modal'], obj.name, 275, 200);
    vo[vo.length] = windowModal;
    vo[vo.length] = windowModal.text;
    vo[vo.length] = windowModal.button_ok;
    vo[vo.length] = windowModal.button_cancel;
    ao['window_modal'] = windowModal;
  }
}

function onInvoiceRowMouseEnter(_e, obj, ctx) {
  const images = ctx.data.images;
  obj.img = images['invoice_row_enter'];
}

function onInvoiceRowMouseLeave(_e, obj, ctx) {
  const images = ctx.data.images;
  obj.img = images['invoice_row'];
}