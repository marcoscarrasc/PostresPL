"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, CheckCircle, Lock, Unlock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import Image from "next/image";

interface CakeSlice {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: any;
}

interface CartItem extends CakeSlice {
  quantity: number;
}

interface Order {
  id: string;
  date: Date;
  customerName: string;
  items: CartItem[];
  total: number;
}
// Función para guardar las órdenes en localStorage
const saveOrdersToLocalStorage = (orders: Order[]) => {
  localStorage.setItem("cakeShopOrders", JSON.stringify(orders));
};

// Función para cargar las órdenes desde localStorage
const loadOrdersFromLocalStorage = (): Order[] => {
  const savedOrders = localStorage.getItem("cakeShopOrders");
  if (savedOrders) {
    // Convertir las fechas de string a objetos Date
    return JSON.parse(savedOrders).map((order: any) => ({
      ...order,
      date: new Date(order.date),
    }));
  }
  return [];
};
const generateWhatsAppMessage = (order: Order) => {
  const itemsText = order.items.map(item => 
    `- ${item.name} x${item.quantity}: S/${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  return `¡Hola Postres Paolita! 😊\n\nQuiero hacer un pedido:\n\n${itemsText}\n\nTotal: S/${order.total.toFixed(2)}\n\nNombre: ${order.customerName}\nFecha: ${format(order.date, "dd/MM/yyyy HH:mm")}\n\n¡Gracias!`;
};
const cakeSlices: CakeSlice[] = [
  {
    id: 1,
    name: " Queque de Chocolate Casero",
    description:
      "Deléitate con nuestro queque de chocolate, esponjoso por dentro y con un intenso sabor a cacao puro. Horneado con ingredientes frescos y un toque de amor, cada rebanada ofrece el equilibrio perfecto entre dulzura y textura húmeda. Ideal para acompañar tu café, compartir en familia o simplemente darte un gusto. ¡Un clásico que nunca falla!",
    price: 2.5,
    imageUrl: "/Queque-de-chocolate.jpg",
  },
  {
    id: 2,
    name: "Queque de naranja",
    description:
      "Suave, esponjoso y con el aroma cítrico que despierta los sentidos. Nuestro queque de naranja está hecho con jugo y ralladura de naranja natural, lo que le da un sabor fresco y equilibrado. Perfecto para acompañar un té o disfrutar como postre ligero, cada bocado es pura frescura y suavidad.",
    price: 2.5,
    imageUrl: "/keke-de-naranja.jpg",
  },
  {
    id: 3,
    name: "Pie de manzana",
    description:
      "Una base crujiente de masa dorada, rellena con manzanas frescas caramelizadas en canela y un toque de nuez moscada. Nuestro pie de manzana es un clásico reconfortante, horneado lentamente para lograr una textura perfecta y un sabor que evoca hogar.",
    price: 4.0,
    imageUrl: "/descarga.jpeg",
  },
];

const ADMIN_PASSWORD = "admin123";

export default function CakeSliceShop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [showOrders, setShowOrders] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    saveOrdersToLocalStorage(orders);
  }, [orders]);

  const addToCart = (cakeSlice: CakeSlice) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === cakeSlice.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === cakeSlice.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...cakeSlice, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevCart.filter((item) => item.id !== id);
      }
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckoutClick = () => {
    setShowCheckoutModal(true);
  };

  const confirmCheckout = () => {
    if (!customerName.trim()) {
      setNameError("Please enter your name");
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date(),
      customerName: customerName.trim(),
      items: [...cart],
      total: totalPrice,
    };

     setOrders((prev) => {
      const updatedOrders = [newOrder, ...prev];
      saveOrdersToLocalStorage(updatedOrders);
      return updatedOrders;
    });
    
    // Generar y enviar mensaje por WhatsApp
    const message = generateWhatsAppMessage(newOrder);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/51932811802?text=${encodedMessage}`; // Reemplaza con tu número real

    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');

    setShowSuccess(true);
    setCart([]);
    setCustomerName("");
    setNameError("");
    setShowCheckoutModal(false);
    setIsCartOpen(false);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleShowOrders = () => {
    if (showOrders) {
      setShowOrders(false);
    } else {
      setShowPasswordModal(true);
    }
  };

  const verifyPassword = () => {
    if (password === ADMIN_PASSWORD) {
      setShowOrders(true);
      setShowPasswordModal(false);
      setPassword("");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 relative">
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed right-4 top-4 bg-rose-600 text-white rounded-full p-3 shadow-lg z-50 hover:bg-rose-700 transition-colors"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-md shadow-md z-50 flex items-center border border-emerald-200"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            ¡Orden realizada con éxito!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`container mx-auto px-4 py-8 ${isCartOpen ? "blur-sm" : ""}`}
      >
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-rose-800 mb-2 font-serif">
            Postres Paolita
          </h1>
          <p className="text-amber-700">
            Delicias horneadas con amor y tradición
          </p>

          {orders.length > 0 && (
            <Button
              variant="outline"
              onClick={handleShowOrders}
              className="flex items-center gap-2 mt-4 mx-auto border-amber-500 text-amber-700 hover:bg-amber-50"
            >
              {showOrders ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {showOrders ? "Ocultar pedidos" : "Ver pedidos"}
            </Button>
          )}
        </header>

        {/* Orders History */}
        {showOrders && orders.length > 0 && (
          <div className="mb-12 bg-white p-6 rounded-xl shadow-sm border border-amber-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-rose-800">
                Historial de Pedidos
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOrders(false)}
                className="text-amber-600 hover:bg-amber-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-amber-100">
                  <CardHeader className="bg-amber-50 rounded-t-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-amber-900">
                          Pedido #{order.id}
                        </CardTitle>
                        <p className="text-sm text-amber-700 mt-1">
                          Cliente: {order.customerName}
                        </p>
                      </div>
                      <span className="text-sm text-amber-600">
                        {format(order.date, "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between py-2 border-b border-amber-50 last:border-0"
                        >
                          <span className="text-amber-900">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium text-amber-800">
                            S/{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between font-bold bg-amber-50 rounded-b-lg py-4 px-6">
                    <span className="text-amber-900">Total:</span>
                    <span className="text-rose-700">
                      S/{order.total.toFixed(2)}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cake Slices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cakeSlices.map((cake) => (
            <Card
              key={cake.id}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-amber-100 overflow-hidden"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={cake.imageUrl}
                  alt={cake.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-rose-800 font-serif text-xl">
                  {cake.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">{cake.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-amber-50">
                <span className="font-bold text-lg text-rose-700">
                  S/{cake.price.toFixed(2)}
                </span>
                <Button
                  onClick={() => addToCart(cake)}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Añadir al carrito
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-40 overflow-y-auto border-l border-amber-100"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-amber-100">
                <h2 className="text-2xl font-bold text-rose-800">Tu carrito</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-amber-600 hover:text-rose-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-amber-300" />
                  <p className="mt-4 text-amber-600">Tu carrito está vacío</p>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 bg-rose-600 hover:bg-rose-700"
                  >
                    Seguir comprando
                  </Button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-amber-100">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 flex justify-between items-center"
                      >
                        <div className="flex space-x-4">
                          <div className="bg-amber-100 border-2 border-dashed border-amber-200 rounded-xl w-16 h-16 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-amber-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-amber-600">
                              S/{item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-amber-900">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-amber-100">
                    <div className="flex justify-between text-lg font-bold mb-6">
                      <span className="text-amber-900">Total:</span>
                      <span className="text-rose-700">
                        S/{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handleCheckoutClick}
                      className="w-full bg-rose-600 hover:bg-rose-700"
                    >
                      Confirmar compra
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => setIsCartOpen(false)}
                    >
                      Continuar comprando
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-amber-100"
            >
              <h3 className="text-2xl font-bold text-rose-800 mb-6 font-serif">
                Completa tu pedido
              </h3>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="customerName" className="text-amber-700 mb-1">
                    Tu nombre
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e: any) => {
                      setCustomerName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    placeholder="Ingresa tu nombre completo"
                    className="mt-1 border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {nameError && (
                    <p className="text-sm text-rose-600 mt-1">{nameError}</p>
                  )}
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h4 className="font-medium text-amber-900 mb-3">
                    Resumen del pedido
                  </h4>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between py-2 border-b border-amber-100 last:border-0"
                      >
                        <span className="text-amber-800">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-amber-700">
                          S/{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold mt-4 pt-3 border-t border-amber-200">
                    <span className="text-amber-900">Total:</span>
                    <span className="text-rose-700">
                      S/{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmCheckout}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Confirmar Pedido
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-amber-100"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-amber-600" />
                  <h3 className="text-xl font-bold text-rose-800">
                    Acceso Administrativo
                  </h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-amber-500 hover:text-rose-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-amber-700 mb-1">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: any) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="Ingresa la contraseña"
                    className="mt-1 border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {passwordError && (
                    <p className="text-sm text-rose-600 mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setPasswordError("");
                  }}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={verifyPassword}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Ver Pedidos
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when cart is open */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <footer className="bg-amber-900/10 py-8 mt-12 border-t border-amber-200">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-serif text-rose-800 mb-2">
            Postres Paolita
          </h3>
          <p className="text-amber-700">
            © {new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
