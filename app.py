import streamlit as st
import google.generativeai as genai
import math

# --- CONFIGURAÇÃO DA PÁGINA ---
st.set_page_config(page_title="Engenheiro de Produção DTF", layout="wide")

# Estilo CSS para parecer profissional (Dark Mode Header)
st.markdown("""
    <style>
    .main-header {background-color: #141414; color: #E4E3E0; padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;}
    .metric-card {background-color: #f0f2f6; padding: 1rem; border-radius: 10px; border: 1px solid #ddd;}
    </style>
    <div class="main-header">
        <h1>🏗️ Engenheiro de Produção DTF</h1>
        <p>LARGURA ÚTIL: 565mm | GAP: 2mm</p>
    </div>
    """, unsafe_allow_config=True)

# --- CONSTANTES ---
LARGURA_UTIL = 565
GAP = 2
FORMATS = {
    'A4': (210, 297), 'A5': (148, 210), 'A6': (105, 148),
    'A7': (74, 105), '10x10': (100, 100), '15x15': (150, 150),
    'Personalizado': (0, 0)
}

# --- ESTADO DA SESSÃO (Para guardar os itens) ---
if "items" not in st.session_state:
    st.session_state.items = []

# --- COLUNA ESQUERDA: INPUTS ---
col_in, col_out = st.columns([1, 2], gap="large")

with col_in:
    st.subheader("⚙️ Configuração")
    custo_metro = st.number_input("Custo por Metro Linear (€)", value=10.0, step=0.1)
    
    st.divider()
    
    st.subheader("📄 Adicionar Ficheiros")
    formato = st.selectbox("Formato", list(FORMATS.keys()))
    
    if formato == 'Personalizado':
        w = st.number_input("Largura (mm)", min_value=1)
        h = st.number_input("Altura (mm)", min_value=1)
    else:
        w, h = FORMATS[formato]
        st.info(f"Dimensões: {w}x{h}mm")
        
    qty = st.number_input("Quantidade", min_value=1, value=1)
    
    if st.button("➕ Adicionar à Produção", use_container_width=True):
        st.session_state.items.append({"name": formato, "w": w, "h": h, "qty": qty})

    # Listagem de itens
    if st.session_state.items:
        st.write("### Lista de Produção")
        for idx, item in enumerate(st.session_state.items):
            cols = st.columns([3, 1])
            cols[0].write(f"**{item['name']}** ({item['w']}x{item['h']}mm) x{item['qty']}")
            if cols[1].button("🗑️", key=f"del_{idx}"):
                st.session_state.items.pop(idx)
                st.rerun()

# --- COLUNA DIREITA: RESULTADOS & IA ---
with col_out:
    if not st.session_state.items:
        st.info("Adicione itens à esquerda para gerar o plano de produção.")
    else:
        if st.button("🚀 Otimizar Encaixe (Smart Nesting)", use_container_width=True):
            # --- Lógica de Cálculo Simples (O que estava no lib/nesting) ---
            comprimento_total_mm = 0
            for item in st.session_state.items:
                # Quantos cabem na largura (565mm)
                cabem_na_largura = LARGURA_UTIL // (item['w'] + GAP)
                if cabem_na_largura == 0: # Peça maior que o rolo
                    st.error(f"O item {item['name']} é mais largo que o rolo!")
                    continue
                
                filas_necessarias = math.ceil(item['qty'] / cabem_na_largura)
                comprimento_total_mm += filas_necessarias * (item['h'] + GAP)
            
            metros = comprimento_total_mm / 1000
            custo_total = metros * custo_metro

            # --- INTEGRAÇÃO COM GEMINI (A "Magia" extra) ---
            st.success("Plano Gerado!")
            
            m1, m2, m3 = st.columns(3)
            m1.metric("Comprimento", f"{metros:.2f} m")
            m2.metric("Custo Est.", f"{custo_total:.2f} €")
            m3.metric("Itens Totais", sum(i['qty'] for i in st.session_state.items))

            # Chamada opcional ao Gemini para conselhos de economia
            api_key = st.sidebar.text_input("Gemini API Key (opcional):", type="password")
            if api_key:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = f"Como especialista em DTF, sugere uma melhor arrumação para estes itens num rolo de 565mm: {st.session_state.items}. Dá dicas para poupar película."
                with st.spinner("O Gemini está a analisar desperdícios..."):
                    res = model.generate_content(prompt)
                    st.chat_message("assistant").write(res.text)
