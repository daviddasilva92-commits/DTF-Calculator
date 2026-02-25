import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Settings2, Printer, ChevronRight, LayoutDashboard } from 'lucide-react';
import { calculateNesting, PackItem, NestingResult } from '../lib/nesting';

const FORMATS = [
  { name: 'A4', w: 210, h: 297 },
  { name: 'A5', w: 148, h: 210 },
  { name: 'A6', w: 105, h: 148 },
  { name: 'A7', w: 74, h: 105 },
  { name: 'A4/2', w: 105, h: 297 },
  { name: 'A5/2', w: 74, h: 210 },
  { name: 'A6/2', w: 52, h: 148 },
  { name: 'A7/2', w: 37, h: 105 },
  { name: '10x10', w: 100, h: 100 },
  { name: '15x15', w: 150, h: 150 },
  { name: 'Personalizado', w: 0, h: 0 },
];

export default function NestingCalculator() {
  const [costPerMeter, setCostPerMeter] = useState<number>(10);
  const [items, setItems] = useState<PackItem[]>([]);
  const [result, setResult] = useState<NestingResult | null>(null);

  const [newItemFormat, setNewItemFormat] = useState(FORMATS[0].name);
  const [newItemW, setNewItemW] = useState<number>(FORMATS[0].w);
  const [newItemH, setNewItemH] = useState<number>(FORMATS[0].h);
  const [newItemQty, setNewItemQty] = useState<number>(1);

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formatName = e.target.value;
    setNewItemFormat(formatName);
    const format = FORMATS.find((f) => f.name === formatName);
    if (format && format.name !== 'Personalizado') {
      setNewItemW(format.w);
      setNewItemH(format.h);
    }
  };

  const handleAddItem = () => {
    if (newItemW <= 0 || newItemH <= 0 || newItemQty <= 0) return;
    
    const name = newItemFormat === 'Personalizado' 
      ? `${newItemW}x${newItemH}` 
      : newItemFormat;

    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        name,
        w: newItemW,
        h: newItemH,
        qty: newItemQty,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleCalculate = () => {
    if (items.length === 0) return;
    const res = calculateNesting(items, costPerMeter);
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="bg-[#141414] text-[#E4E3E0] py-6 px-8 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Printer className="w-6 h-6" />
          <h1 className="text-xl font-medium tracking-tight">Engenheiro de Produção DTF</h1>
        </div>
        <div className="text-sm font-mono opacity-60">
          LARGURA ÚTIL: 565mm | GAP: 2mm
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Settings Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-black/5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-lg">Configuração</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Custo por Metro Linear (€)
              </label>
              <input
                type="number"
                value={costPerMeter}
                onChange={(e) => setCostPerMeter(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Add Item Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-black/5">
            <h2 className="font-semibold text-lg mb-4">Adicionar Ficheiros</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Formato</label>
                <select
                  value={newItemFormat}
                  onChange={handleFormatChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                >
                  {FORMATS.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} {f.name !== 'Personalizado' ? `(${f.w}x${f.h}mm)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {newItemFormat === 'Personalizado' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Largura (mm)</label>
                    <input
                      type="number"
                      value={newItemW}
                      onChange={(e) => setNewItemW(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Altura (mm)</label>
                    <input
                      type="number"
                      value={newItemH}
                      onChange={(e) => setNewItemH(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade</label>
                <input
                  type="number"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black/5"
                  min="1"
                />
              </div>

              <button
                onClick={handleAddItem}
                className="w-full bg-[#141414] text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2 hover:bg-black/80 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Ficheiro
              </button>
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-black/5">
              <h2 className="font-semibold text-lg mb-4">Lista de Produção</h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{item.w}x{item.h}mm • {item.qty} un</div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-emerald-600 text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Calculator className="w-5 h-5" />
                Otimizar Encaixe
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
              <div className="bg-[#141414] text-white p-6">
                <div className="flex items-center gap-3 mb-2">
                  <LayoutDashboard className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-semibold">Plano de Produção DTF (Otimizado)</h2>
                </div>
                <p className="text-gray-400 text-sm">Análise gerada com base em Smart Nesting</p>
              </div>

              <div className="p-8 space-y-8">
                
                {/* 1. Análise */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Análise de Itens e Orientação
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    {result.itemAnalysis.map((analysis, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                        <span>{analysis}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* 2. Smart Nesting */}
                {result.smartNestingNotes.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Encaixe Inteligente (Smart Nesting)
                    </h3>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-emerald-800">
                      <ul className="space-y-2">
                        {result.smartNestingNotes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}

                {/* 3. Visual Plan */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    Plano de Organização Visual
                  </h3>
                  <div className="bg-[#141414] text-[#E4E3E0] p-6 rounded-xl font-mono text-sm overflow-x-auto whitespace-pre">
                    <div className="text-gray-500 mb-2">|--- Rolo 56,5cm ------------------------------------------------|</div>
                    {result.groups.map((group, idx) => {
                      const itemsVisual = group.row.items.map(i => {
                        return Array(i.count).fill(`[ ${i.name} ]`).join(' ');
                      }).join(' ');
                      
                      const emptySpace = group.row.freeWidth > 10 ? '[ vazio ]' : '';
                      
                      return (
                        <div key={idx} className="flex items-center py-1 hover:bg-white/5 transition-colors">
                          <div className="flex-grow">
                            | {itemsVisual} {emptySpace}
                          </div>
                          <div className="text-gray-500 ml-4 flex-shrink-0">
                            | ({group.count} fila{group.count > 1 ? 's' : ''}) |
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-gray-500 mt-2">|----------------------------------------------------------------|</div>
                  </div>
                </section>

                {/* 4. Metrics */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                    Métricas Finais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Comprimento Base</div>
                      <div className="text-xl font-mono">{result.baseLength.toFixed(2)}m</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Margem de Segurança</div>
                      <div className="text-xl font-mono">+{result.margin.toFixed(2)}m</div>
                    </div>
                    <div className="bg-gray-900 text-white p-4 rounded-lg md:col-span-2 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Total de Película</div>
                        <div className="text-2xl font-mono text-emerald-400">{result.totalLength.toFixed(2)} Metros Lineares</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Investimento</div>
                        <div className="text-2xl font-mono">{result.totalCost.toFixed(2)}€</div>
                      </div>
                    </div>
                  </div>
                  {result.smartNestingNotes.length > 0 && (
                    <div className="mt-4 text-sm text-gray-500 italic">
                      Dica: A otimização de espaço lateral ajudou a reduzir o comprimento total necessário.
                    </div>
                  )}
                </section>

              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-xl border border-dashed border-gray-300 p-12">
              <Printer className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-500">Nenhum plano gerado</p>
              <p className="text-sm">Adicione ficheiros e clique em "Otimizar Encaixe" para ver o resultado.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
