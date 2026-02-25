import streamlit as st
import google.generativeai as genai

# Configuração da API
genai.configure(api_key=AIzaSyCZIKVEBiY_-ETFWcV1lmzQVnsFtYqBVeQ)

# Instruções de Sistema que criámos
SYSTEM_PROMPT = """
Atua como Calculador de Produção DTF (Rolo 565mm).
Regras Largura Útil 565mm, Gap 5mm, Margem Técnica +15cm.
Suporta ISO A4-A7 e metades (ex A52 é 74x210mm).
Faz Nesting Inteligente e apresenta o Quadro Visual em texto (Ex  [A4] [A4] ).
Responde sempre em Português de Portugal. """


st.set_page_config(page_title="Calculadora DTF Pro", layout="centered")
st.title("Calculadora de Metros DTF")

# Interface da App
with st.sidebar
    st.header(Configurações)
    preco_metro = st.number_input("Preço por Metro Linear (€)", value=10.0)
    st.info(Rolo padrão 56,5 cm)

user_input = st.text_area(Descreve a encomenda, 
    placeholder="Ex 50 logos A5 e 20 logos de 10x10cm. O custo é 12€/m.")

if st.button(Calcular Produção)
    model = genai.GenerativeModel(
        model_name=gemini-1.5-flash,
        system_instruction=SYSTEM_PROMPT
    )
    
    with st.spinner('A otimizar o rolo...')
        response = model.generate_content(f"Custo: {preco_metro}€/m. Pedido: {user_input}")
        st.markdown(response.text)
