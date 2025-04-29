import { Link } from 'wouter';
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2C3E50] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">Autologic</h3>
            <p className="text-neutral-300 text-sm mb-4">
              Sistema inteligente de diagnóstico automotriz y recomendación de piezas.
            </p>
            <div className="flex space-x-3">
              <SocialIcon icon={<FacebookIcon className="h-5 w-5" />} />
              <SocialIcon icon={<InstagramIcon className="h-5 w-5" />} />
              <SocialIcon icon={<TwitterIcon className="h-5 w-5" />} />
              <SocialIcon icon={<YoutubeIcon className="h-5 w-5" />} />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Categorías</h4>
            <ul className="space-y-2 text-neutral-300">
              <FooterLink href="/catalog?category=frenos">Frenos</FooterLink>
              <FooterLink href="/catalog?category=suspension">Suspensión</FooterLink>
              <FooterLink href="/catalog?category=motor">Motor</FooterLink>
              <FooterLink href="/catalog?category=filtros">Filtros</FooterLink>
              <FooterLink href="/catalog?category=transmision">Transmisión</FooterLink>
              <FooterLink href="/catalog">Ver todas</FooterLink>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Información</h4>
            <ul className="space-y-2 text-neutral-300">
              <FooterLink href="/about">Sobre nosotros</FooterLink>
              <FooterLink href="/shipping">Políticas de envío</FooterLink>
              <FooterLink href="/terms">Términos y condiciones</FooterLink>
              <FooterLink href="/privacy">Política de privacidad</FooterLink>
              <FooterLink href="/warranty">Garantías</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4">Contacto</h4>
            <ul className="space-y-3 text-neutral-300">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                <span>Av. Revolución 1234, Col. Centro, Ciudad de México, CP 12345</span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 shrink-0" />
                <span>+52 (55) 1234-5678</span>
              </li>
              <li className="flex items-center">
                <MailIcon className="h-5 w-5 mr-2 shrink-0" />
                <span>soporte@autologic.mx</span>
              </li>
              <li className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 shrink-0" />
                <span>Lun-Vie: 9am-6pm, Sáb: 9am-2pm</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Autologic. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-3">
            <PaymentMethod name="Visa" />
            <PaymentMethod name="Mastercard" />
            <PaymentMethod name="PayPal" />
            <PaymentMethod name="OXXO" />
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li>
      <Link href={href} className="hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="text-white hover:text-primary transition-colors">
      {icon}
    </a>
  );
}

function PaymentMethod({ name }: { name: string }) {
  return (
    <div className="bg-white rounded h-8 w-12 flex items-center justify-center text-xs text-neutral-800">
      {name}
    </div>
  );
}
