export interface Food {
  id: string
  name: string
  carbsPerPortion: number  // grams of carbs in 1 typical portion
  portionLabel: string
}

export const FOOD_DATABASE: Food[] = [
  // Pan y harinas
  { id: 'arroz',             name: 'Arroz cocido',          carbsPerPortion: 42, portionLabel: '1 plato chico (150g)' },
  { id: 'fideos',            name: 'Fideos cocidos',         carbsPerPortion: 50, portionLabel: '1 plato (200g)' },
  { id: 'pan-frances',       name: 'Pan francés',            carbsPerPortion: 32, portionLabel: '1 unidad (60g)' },
  { id: 'pan-lactal',        name: 'Pan lactal',             carbsPerPortion: 12, portionLabel: '1 rebanada (25g)' },
  { id: 'polenta',           name: 'Polenta cocida',         carbsPerPortion: 24, portionLabel: '1 plato (200g)' },
  // Tubérculos
  { id: 'papa-hervida',      name: 'Papa hervida / al horno', carbsPerPortion: 26, portionLabel: '1 papa mediana (150g)' },
  { id: 'pure-papa',         name: 'Puré de papa',           carbsPerPortion: 20, portionLabel: '1 porción (150g)' },
  { id: 'papa-frita',        name: 'Papa frita',             carbsPerPortion: 26, portionLabel: '1 porción (100g)' },
  { id: 'choclo',            name: 'Choclo en mazorca',      carbsPerPortion: 20, portionLabel: '1 mazorca (120g)' },
  // Carnes
  { id: 'milanesa-carne',    name: 'Milanesa de carne',      carbsPerPortion: 12, portionLabel: '1 unidad (150g)' },
  { id: 'milanesa-pollo',    name: 'Milanesa de pollo',      carbsPerPortion: 10, portionLabel: '1 unidad (120g)' },
  // Comidas
  { id: 'empanada-carne',    name: 'Empanada de carne',      carbsPerPortion: 20, portionLabel: '1 unidad' },
  { id: 'empanada-verdura',  name: 'Empanada de verdura',    carbsPerPortion: 22, portionLabel: '1 unidad' },
  { id: 'pizza',             name: 'Pizza muzzarella',       carbsPerPortion: 30, portionLabel: '1 porción (100g)' },
  { id: 'hamburguesa',       name: 'Hamburguesa con pan',    carbsPerPortion: 30, portionLabel: '1 completa' },
  { id: 'tarta-verdura',     name: 'Tarta de verdura',       carbsPerPortion: 25, portionLabel: '1 porción' },
  // Frutas
  { id: 'banana',            name: 'Banana',                 carbsPerPortion: 22, portionLabel: '1 unidad mediana (100g)' },
  { id: 'manzana',           name: 'Manzana',                carbsPerPortion: 21, portionLabel: '1 unidad (150g)' },
  { id: 'naranja',           name: 'Naranja',                carbsPerPortion: 18, portionLabel: '1 unidad (150g)' },
  { id: 'mandarina',         name: 'Mandarina',              carbsPerPortion: 12, portionLabel: '1 unidad (100g)' },
  { id: 'uva',               name: 'Uva',                    carbsPerPortion: 17, portionLabel: '1 porción (100g)' },
  { id: 'durazno',           name: 'Durazno',                carbsPerPortion: 13, portionLabel: '1 unidad (100g)' },
  // Lácteos
  { id: 'leche',             name: 'Leche entera',           carbsPerPortion: 10, portionLabel: '1 vaso (200ml)' },
  { id: 'yogur',             name: 'Yogur entero',           carbsPerPortion: 8,  portionLabel: '1 pote (150g)' },
  // Panadería y dulces
  { id: 'medialuna',         name: 'Medialuna',              carbsPerPortion: 20, portionLabel: '1 unidad' },
  { id: 'factura',           name: 'Factura',                carbsPerPortion: 25, portionLabel: '1 unidad' },
  { id: 'galletitas-dulces', name: 'Galletitas dulces',      carbsPerPortion: 15, portionLabel: '6 unidades (30g)' },
  { id: 'galletitas-agua',   name: 'Galletitas de agua',     carbsPerPortion: 12, portionLabel: '6 unidades (30g)' },
  // Bebidas
  { id: 'jugo-naranja',      name: 'Jugo de naranja',        carbsPerPortion: 20, portionLabel: '1 vaso (200ml)' },
  { id: 'gaseosa',           name: 'Gaseosa cola',           carbsPerPortion: 26, portionLabel: '1 lata (250ml)' },
  // Legumbres
  { id: 'lentejas',          name: 'Lentejas cocidas',       carbsPerPortion: 20, portionLabel: '1 porción (100g)' },
  { id: 'garbanzos',         name: 'Garbanzos cocidos',      carbsPerPortion: 27, portionLabel: '1 porción (100g)' },
]
