// src/lib/dna.ts

import type { Briefing } from '../types'

const DNA: Record<Briefing['tipo'], string> = {
  servico: `## DNA: Prestador de Serviço

**Tom:** Confiante, direto, focado em resultado tangível.
**Perspectiva:** "Eu resolvo seu problema" — não "eu ofereço um serviço".
**Foco:** Transformação antes/depois. O visitante deve sentir que o problema dele tem solução aqui.

**Copy que funciona:**
- Hero: atacar a dor principal no título. Subheadline com o resultado esperado.
- CTA: verbos de ação imediata — "Agende agora", "Fale comigo hoje", "Quero resolver isso".
- Sobre: credenciais rapidamente, depois voltar ao cliente — não fazer monólogo sobre si.
- Depoimentos: resultado específico + prazo + nome real. Ex: "Resolvi em 3 dias o que levava semanas".

**Evitar:** Jargão técnico, parágrafos longos, muito sobre o processo e pouco sobre o resultado.`,

  mentoria: `## DNA: Mentoria

**Tom:** Inspirador, próximo, autoridade que já passou pelo caminho.
**Perspectiva:** "Eu já estive onde você está" — mentor como guia, não como guru distante.
**Foco:** Transformação de identidade. Quem o aluno será depois, não o que ele aprenderá.

**Copy que funciona:**
- Hero: espelho da situação atual do público + visão do futuro possível.
- Sobre: história de superação do mentor — vulnerabilidade gera conexão.
- Como funciona: mostrar o método como um sistema claro, não uma lista de aulas.
- Depoimentos: jornada completa — de onde veio, o que mudou, onde chegou.
- CTA: exclusividade e urgência — "Vagas limitadas", "Próxima turma em X".

**Evitar:** Prometer resultados garantidos, linguagem corporativa, foco excessivo em certificados.`,

  consultoria: `## DNA: Consultoria

**Tom:** Especialista, racional, orientado a ROI e negócios.
**Perspectiva:** "Eu analiso, diagnostico e entrego solução" — posicionamento técnico.
**Foco:** Problema de negócio específico + método comprovado + resultado mensurável.

**Copy que funciona:**
- Hero: problema de negócio + impacto financeiro/operacional.
- Diferenciais: método próprio, cases com números, empresas atendidas.
- Como funciona: processo claro em fases — diagnóstico, estratégia, implementação.
- Prova: logos de clientes, depoimentos de decisores (CEO, diretor), métricas reais.
- CTA: "Agendar diagnóstico gratuito", "Conversar sobre seu projeto".

**Evitar:** Linguagem vaga, promessas sem método, foco em processo sem resultado.`,

  produto: `## DNA: Produto Físico ou Digital

**Tom:** Entusiasta, focado em benefícios, prova social forte.
**Perspectiva:** "Este produto muda como você faz X" — produto como solução, não como objeto.
**Foco:** Benefício principal acima de features. Mostrar o produto em uso, não apenas descrevê-lo.

**Copy que funciona:**
- Hero: benefício #1 no título. Imagem do produto em contexto de uso.
- Features: sempre traduzir para benefício — "Wi-Fi 6 (= conexão que nunca cai)".
- Prova: reviews reais, unboxing, antes/depois de quem usou.
- Preço: mostrar valor percebido antes do preço. Comparação com alternativas.
- CTA: "Comprar agora", "Adicionar ao carrinho", "Garantir o meu".

**Evitar:** Specs técnicas sem tradução, fotos de produto sem contexto, urgência falsa.`,

  saas: `## DNA: SaaS / Software

**Tom:** Técnico-acessível, focado em produtividade e ROI, tom de startup.
**Perspectiva:** "Esta ferramenta faz X por você automaticamente" — foco em automação e ganho.
**Foco:** Problema específico que o software resolve + demo ou trial.

**Copy que funciona:**
- Hero: o que o software faz em 1 frase + CTA para trial/demo.
- Features: screenshots reais da interface — mostrar > descrever.
- Integrations: logos de ferramentas que conectam (aumenta confiança técnica).
- Pricing: tabela clara com planos. Free tier ou trial destacado.
- Social proof: número de usuários, avaliações G2/Capterra, logos de empresas.
- CTA: "Testar grátis", "Ver demonstração", "Começar agora".

**Evitar:** Excesso de features sem hierarquia, copy genérico de "plataforma completa".`,

  curso: `## DNA: Curso Online / Infoproduto

**Tom:** Motivador, educador, com senso de oportunidade e transformação.
**Perspectiva:** "Você pode aprender isso" — democratizar o conhecimento do especialista.
**Foco:** Resultado concreto que o aluno alcança + quem é o aluno ideal.

**Copy que funciona:**
- Hero: "Aprenda X e conquiste Y em Z dias/semanas" — resultado com prazo.
- Para quem é: bullet points negativos + positivos — "Para quem cansa de X / Quer Y".
- Módulos: mostrar a jornada de aprendizado como uma progressão lógica.
- Instrutor: credenciais relevantes + história de por que criou o curso.
- Bônus: listar com valor monetário atribuído ("Bônus 1: planilha de X — Valor R$197").
- Garantia: 7 ou 30 dias de garantia com destaque visual.
- CTA: "Quero me inscrever", "Garantir minha vaga", "Começar agora".

**Evitar:** Prometer enriquecimento rápido, depoimentos falsos, excesso de bônus sem valor real.`,
}

export function getDNAByType(tipo: Briefing['tipo']): string {
  return DNA[tipo] ?? DNA['servico']
}
