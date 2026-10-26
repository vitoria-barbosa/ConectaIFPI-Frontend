import React from "react";
import { ExternalLink } from "lucide-react";

export const Rodape: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600 text-xs py-10 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Coluna 1: Institucional */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#2F9E41] flex items-center justify-center p-0.5">
                <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                  <div className="bg-[#CD191E] rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                </div>
              </div>
              <span className="font-bold text-slate-900 text-sm">
                ConectaIFPI · Campus Teresina Central
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Plataforma acadêmica do Instituto Federal de Educação, Ciência e
              Tecnologia do Piauí. Divulgação de eventos de extensão, pesquisa,
              inovação e artes com integração de dados com o SUAP.
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              O ConectaIFPI atua como vitrine de divulgação e agenda interativa.
              Inscrições formais e emissão de certificados acadêmicos são
              processados exclusivamente pelo SUAP oficial.
            </p>
            <p className="text-[11px] text-slate-400">
              Praça da Liberdade, 1597 - Centro, Teresina - PI, CEP 64000-040.
            </p>
          </div>

          {/* Coluna 2: Portais Oficiais */}
          <div className="space-y-2 md:justify-self-end md:text-right">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Sistemas Institucionais
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://suap.ifpi.edu.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2F9E41] flex items-center gap-1 transition-colors md:justify-end"
                >
                  <span>SUAP IFPI</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ifpi.edu.br/teresinacentral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2F9E41] flex items-center gap-1 transition-colors md:justify-end"
                >
                  <span>Portal Campus Teresina Central</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © 2026 IFPI Campus Teresina Central. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
