import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image, // Importar o componente Image
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Importar a imagem. Certifique-se que o caminho está correto!
// Assume que 'inquietacao.png' está dentro da pasta 'assets' na raiz do seu projeto.
import inquietacaoImage from './assets/inquietacao.png'; // OU './assets/inquietacao.jpg' se for jpg

// Reutilizamos a interface RegistroSono e TemaCores do App.tsx para consistência
interface RegistroSono {
  id: string;
  horaInicio: Date;
  horaFim: Date | null;
  duracao: number;
  qualidade: string;
  nivelInquietacao?: number;
}

interface TemaCores {
  fundoPrincipal: string;
  fundoCabecalho: string;
  textoCabecalho: string;
  fundoCartao: string;
  textoPrincipal: string;
  textoSecundario: string;
  fundoBotaoRecompensas: string;
  fundoAreaJogo: string;
  bordaAreaJogo: string;
  corJogador: string;
  corObstaculo: string;
  corChao: string;
  fundoItemRegistro: string;
  bordaItemRegistro: string;
}

// Propriedades para a InquietacaoScreen
interface InquietacaoScreenProps {
  aoVoltar: () => void;
  registrosSono: RegistroSono[];
  cores: TemaCores;
}

const { width } = Dimensions.get('window');

const InquietacaoScreen: React.FC<InquietacaoScreenProps> = ({
  aoVoltar,
  registrosSono,
  cores,
}) => {
  // Filtrar registros que possuem nivelInquietacao
  const registrosComInquietacao = registrosSono.filter(
    (registro) => registro.nivelInquietacao !== undefined
  );

  // Calcular a média de inquietação
  const mediaInquietacao =
    registrosComInquietacao.length > 0
      ? registrosComInquietacao.reduce((sum, r) => sum + (r.nivelInquietacao || 0), 0) /
        registrosComInquietacao.length
      : 0;

  // Preparar dados para o gráfico
  // Rótulos (datas ou IDs) e valores (níveis de inquietação)
  const chartLabels = registrosComInquietacao.map((r) =>
    r.horaInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  ).reverse();
  const chartData = registrosComInquietacao.map((r) => r.nivelInquietacao || 0).reverse();

  // Função para determinar a classificação da inquietação (para cores/ícones)
  const getClassificacaoInquietacao = (nivel?: number) => {
    if (nivel === undefined) return { texto: 'N/A', cor: cores.textoSecundario };
    if (nivel <= 5000) return { texto: 'Baixa', cor: '#4CAF50' }; // Verde
    if (nivel <= 15000) return { texto: 'Média', cor: '#FFC107' }; // Amarelo
    return { texto: 'Alta', cor: '#F44336' }; // Vermelho
  };

  return (
    <View style={[estilos.container, { backgroundColor: cores.fundoPrincipal }]}>
      <View style={[estilos.cabecalho, { backgroundColor: cores.fundoCabecalho }]}>
        <Text style={[estilos.titulo, { color: cores.textoCabecalho }]}>Níveis de Inquietação</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.scrollViewContent}>

        {/* Adicionar a imagem aqui */}
        <Image source={inquietacaoImage} style={estilos.imagemExplicativa} resizeMode="contain" />

        {/* Média de Inquietação */}
        <View style={[estilos.card, { backgroundColor: cores.fundoCartao }]}>
          <Text style={[estilos.cardTitulo, { color: cores.textoPrincipal }]}>Média de Inquietação Registrada</Text>
          <Text style={[estilos.mediaTexto, { color: cores.corJogador }]}>
            {mediaInquietacao.toFixed(2)}
          </Text>
          <Text style={[estilos.cardDescricao, { color: cores.textoSecundario }]}>
            (Movimento total por hora de sono)
          </Text>
        </View>

        {/* Gráfico de Inquietação */}
        {registrosComInquietacao.length > 0 ? (
          <View style={[estilos.card, { backgroundColor: cores.fundoCartao }]}>
            <Text style={[estilos.cardTitulo, { color: cores.textoPrincipal }]}>Histórico de Inquietação</Text>
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: chartData,
                    color: (opacity = 1) => `rgba(106, 13, 173, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={width * 0.85}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: cores.fundoCartao,
                backgroundGradientFrom: cores.fundoCartao,
                backgroundGradientTo: cores.fundoCartao,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: cores.fundoCabecalho,
                },
              }}
              bezier
              style={estilos.graficoEstilo}
            />
          </View>
        ) : (
          <View style={[estilos.card, { backgroundColor: cores.fundoCartao }]}>
            <Text style={[estilos.textoSemRegistros, { color: cores.textoSecundario }]}>
              Nenhum registro de inquietação disponível para o gráfico.
            </Text>
          </View>
        )}

        {/* Lista Detalhada de Registros com Classificação Visual */}
        <View style={[estilos.card, { backgroundColor: cores.fundoCartao, paddingVertical: 10 }]}>
            <Text style={[estilos.cardTitulo, { color: cores.textoPrincipal, marginBottom: 15 }]}>Detalhes dos Registros</Text>
            {registrosComInquietacao.length === 0 ? (
                <Text style={[estilos.textoSemRegistros, { color: cores.textoSecundario }]}>
                    Nenhum registro de sono com nível de inquietação.
                </Text>
            ) : (
                registrosComInquietacao.map((registro) => {
                    const { texto, cor } = getClassificacaoInquietacao(registro.nivelInquietacao);
                    return (
                        <View key={registro.id} style={[estilos.itemRegistro, { borderColor: cores.bordaItemRegistro }]}>
                            <Text style={[estilos.textoRegistro, { color: cores.textoPrincipal }]}>
                                Início: {registro.horaInicio.toLocaleString()}
                            </Text>
                            <Text style={[estilos.textoRegistro, { color: cores.textoPrincipal }]}>
                                Duração: {registro.duracao.toFixed(2)} horas
                            </Text>
                            <Text style={[estilos.textoRegistro, { color: cores.textoPrincipal }]}>
                                Nível de Inquietação: {registro.nivelInquietacao?.toFixed(2) || 'N/A'}
                            </Text>
                            <Text style={[estilos.classificacaoInquietacao, { color: cor }]}>
                                Classificação: {texto}
                            </Text>
                        </View>
                    );
                }).reverse()
            )}
        </View>

      </ScrollView>

      {/* Botão Voltar */}
      <TouchableOpacity
        style={[estilos.botaoVoltar, { backgroundColor: cores.fundoCabecalho }]}
        onPress={aoVoltar}
      >
        <Text style={[estilos.textoBotaoVoltar, { color: cores.textoCabecalho }]}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos para a InquietacaoScreen (adicionado estilo para a imagem)
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  cabecalho: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  // NOVO ESTILO PARA A IMAGEM
  imagemExplicativa: {
    width: '100%', // Ajusta a largura para o tamanho do card
    height: 180, // Altura fixa, pode ajustar
    marginBottom: 20, // Espaçamento abaixo da imagem
    borderRadius: 15, // Para manter o estilo arredondado dos cards
    resizeMode: 'contain', // Garante que a imagem se ajuste sem cortar
  },
  card: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescricao: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  mediaTexto: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  graficoEstilo: {
    marginVertical: 8,
    borderRadius: 16,
  },
  textoSemRegistros: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  itemRegistro: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    paddingVertical: 10,
  },
  textoRegistro: {
    fontSize: 16,
    marginBottom: 3,
  },
  classificacaoInquietacao: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  botaoVoltar: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textoBotaoVoltar: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InquietacaoScreen;