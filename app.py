import streamlit as st
import google.generativeai as genai

# 1. Configuração da API (Recomendado usar st.secrets["GOOGLE_API_KEY"])
# Se quiseres testar localmente, coloca a chave entre aspas: "AIzaSy..."
try:
    CHAVE = st.secrets["GOOGLE_API_KEY"]
    genai.configure(api_key=CHAVE)
except:
    st.error("Erro: Configura a GOOGLE_API_KEY nos Secrets do Streamlit.")

# 2. Instruções de Sistema
SYSTEM_PROMPT = """
Atua como Calculador de Produção DTF (Rolo 565mm).
Regras: Largura Útil 565mm, Gap 5mm, Margem Técnica +15cm.
Suporta ISO A4-A7 e metades (ex: A5/2 é 74x210mm).
Faz Nesting Inteligente e apresenta o Quadro Visual em texto (Ex: [A4] [A4]).
Responde sempre em Português de Portugal.
"""

# 3. Configuração da Página
st.set_page_config(page_title="Calculadora DTF Pro", layout="centered")
st.title("Calculadora de Metros DTF")

# 4. Interface da App (Correção de aspas e dois pontos)
with st.sidebar:
    st.header("Configurações")
    preco_metro = st.number_input("Preço por Metro Linear (€)", value=10.0)
    st.info("Rolo padrão: 56,5 cm")

user_input = st.text_area(
    "Descreve a encomenda:", 
    placeholder="Ex: 50 logos A5 e 20 logos de 10x10cm."
)

# 5. Lógica do Botão (Correção de aspas, parêntesis e dois pontos)
if st.button("Calcular Produção"):
    if not user_input:
        st.warning("Por favor, descreve a encomenda.")
    else:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_PROMPT
        )
        
        with st.spinner('A otimizar o rolo...'):
            try:
                # Criar a mensagem para a IA
                mensagem = f"Custo: {preco_metro}€/m. Pedido: {user_input}"
                response = model.generate_content(mensagem)
                st.markdown("### Plano de Produção Sugerido")
                st.markdown(response.text)
            except Exception as e:
                st.error(f"Erro na geração: {e}")
