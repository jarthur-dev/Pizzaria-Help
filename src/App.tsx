import { CartDrawer } from './components/CartDrawer'
import { Catalog } from './components/Catalog'
import { ChatBot } from './components/ChatBot'
import { ChatFab } from './components/ChatFab'
import { Faq } from './components/Faq'
import { FeaturedCarousel } from './components/FeaturedCarousel'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { CartProvider } from './context/CartContext'
import { UIProvider } from './context/UIContext'

export default function App() {
  return (
    <UIProvider>
      <CartProvider>
        <a className="skip-link" href="#cardapio">
          Ir para o cardápio
        </a>
        <Header />
        <main>
          <Hero />
          <FeaturedCarousel />
          <Catalog />
          <HowItWorks />
          <Faq />
        </main>
        <Footer />
        <CartDrawer />
        <ChatBot />
        <ChatFab />
      </CartProvider>
    </UIProvider>
  )
}
