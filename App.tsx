import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface RegistroSono {
  id: string;
  horaInicio: Date;
  horaFim: Date | null;
  duracao: number;
  qualidade: string;
}

const TAMANHO_JOGADOR = 50;
const LARGURA_OBSTACULO = 30;
const ALTURA_OBSTACULO = 60;
const NIVEL_CHAO = 50;

interface PropsTelaJogo {
  aoVoltar: () => void;
  cores: TemaCores;
}

const GameScreen: React.FC<PropsTelaJogo> = ({ aoVoltar, cores }) => {
  const [estadoJogo, setEstadoJogo] = useState<'pronto' | 'jogando' | 'perdeu'>('pronto');
  const [pontuacao, setPontuacao] = useState(0);
  const [recorde, setRecorde] = useState(0);

  const jogadorY = useRef(new Animated.Value(0)).current;
  const obstaculoX = useRef(new Animated.Value(width)).current;

  const obstaculoXValor = useRef(width);
  const jogadorYValor = useRef(0);

  useEffect(() => {
    const listenerObstaculo = obstaculoX.addListener(({ value }) => {
      obstaculoXValor.current = value;
      verificarColisao();
    });
    const listenerJogador = jogadorY.addListener(({ value }) => {
      jogadorYValor.current = value;
      verificarColisao();
    });

    return () => {
      obstaculoX.removeListener(listenerObstaculo);
      jogadorY.removeListener(listenerJogador);
    };
  }, [estadoJogo]);

  useEffect(() => {
    if (estadoJogo === 'jogando') {
      setPontuacao(0);
      jogadorY.setValue(0);
      obstaculoX.setValue(width);
      animarObstaculo();
    } else if (estadoJogo === 'perdeu') {
      obstaculoX.stopAnimation();
      jogadorY.stopAnimation();
      if (pontuacao > recorde) {
        setRecorde(pontuacao);
      }
    }
  }, [estadoJogo]);

  const animarObstaculo = () => {
    obstaculoX.setValue(width);
    Animated.timing(obstaculoX, {
      toValue: -LARGURA_OBSTACULO,
      duration: 3000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        if (estadoJogo === 'jogando') {
          setPontuacao(prev => prev + 1);
          animarObstaculo();
        }
      }
    });
  };

  const pular = () => {
    if (estadoJogo !== 'jogando') return;
    jogadorY.setValue(0);
    Animated.sequence([
      Animated.timing(jogadorY, {
        toValue: -180,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(jogadorY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const verificarColisao = () => {
    if (estadoJogo !== 'jogando') return;

    const jogadorEsquerda = 50;
    const jogadorDireita = jogadorEsquerda + TAMANHO_JOGADOR;
    const jogadorBase = NIVEL_CHAO + jogadorYValor.current;
    const jogadorTopo = jogadorBase + TAMANHO_JOGADOR;

    const obstaculoEsquerda = obstaculoXValor.current;
    const obstaculoDireita = obstaculoEsquerda + LARGURA_OBSTACULO;
    const obstaculoBase = NIVEL_CHAO;
    const obstaculoTopo = obstaculoBase + ALTURA_OBSTACULO;

    if (
      jogadorDireita > obstaculoEsquerda &&
      jogadorEsquerda < obstaculoDireita &&
      jogadorTopo > obstaculoBase &&
      jogadorBase < obstaculoTopo
    ) {
      setEstadoJogo('perdeu');
    }
  };

  const reiniciarJogo = () => {
    setEstadoJogo('pronto');
    jogadorY.setValue(0);
    obstaculoX.setValue(width);
    setPontuacao(0);
  };

  return (
    <View style={[estilosJogo.containerJogo, { backgroundColor: cores.fundoPrincipal }]}>
      <Text style={[estilosJogo.tituloJogo, { color: cores.textoPrincipal }]}>Soninho Runner</Text>
      <View style={[estilosJogo.areaJogo, { backgroundColor: cores.fundoAreaJogo, borderColor: cores.bordaAreaJogo }]}>
        <Text style={[estilosJogo.contadorPontos, { color: cores.textoPrincipal }]}>Pontos: {pontuacao}</Text>
        <Animated.View
          style={[
            estilosJogo.jogador,
            {
              transform: [{ translateY: jogadorY }],
              bottom: NIVEL_CHAO,
              backgroundColor: cores.corJogador,
            },
          ]}
        />
        {(estadoJogo === 'jogando' || estadoJogo === 'perdeu') && (
          <Animated.View
            style={[
              estilosJogo.obstaculo,
              {
                transform: [{ translateX: obstaculoX }],
                bottom: NIVEL_CHAO,
                backgroundColor: cores.corObstaculo,
              },
            ]}
          />
        )}
        <View style={[estilosJogo.chao, { backgroundColor: cores.corChao }]} />
      </View>

      {estadoJogo === 'pronto' && (
        <TouchableOpacity
          style={[estilosJogo.botaoJogo, { backgroundColor: cores.fundoCabecalho }]} // Cor padronizada
          onPress={() => setEstadoJogo('jogando')}
        >
          <Text style={estilosJogo.textoBotaoJogo}>Iniciar Jogo</Text>
        </TouchableOpacity>
      )}

      {estadoJogo === 'jogando' && (
        <TouchableOpacity
          style={[estilosJogo.botaoJogo, { backgroundColor: cores.fundoCabecalho }]} // Cor padronizada
          onPress={pular}
        >
          <Text style={estilosJogo.textoBotaoJogo}>Pular</Text>
        </TouchableOpacity>
      )}

      {estadoJogo === 'perdeu' && (
        <View style={estilosJogo.containerPerdeu}>
          <Text style={estilosJogo.textoPerdeu}>Você perdeu!</Text>
          <TouchableOpacity style={estilosJogo.botaoRecomecar} onPress={reiniciarJogo}>
            <Text style={estilosJogo.textoBotaoRecomecar}>Recomeçar</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={[estilosJogo.recordeTexto, { color: cores.textoPrincipal }]}>Recorde: {recorde}</Text>

      <TouchableOpacity style={estilosJogo.botaoVoltar} onPress={aoVoltar}>
        <Text style={estilosJogo.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const estilosJogo = StyleSheet.create({
  containerJogo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  tituloJogo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  areaJogo: {
    width: width * 0.9,
    height: 200,
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  contadorPontos: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 1,
  },
  jogador: {
    position: 'absolute',
    left: 50,
    width: TAMANHO_JOGADOR,
    height: TAMANHO_JOGADOR,
    borderRadius: 8,
  },
  obstaculo: {
    position: 'absolute',
    width: LARGURA_OBSTACULO,
    height: ALTURA_OBSTACULO,
    borderRadius: 5,
  },
  chao: {
    position: 'absolute',
    bottom: NIVEL_CHAO - 5,
    width: '100%',
    height: 5,
  },
  botaoJogo: {
    backgroundColor: '#4CAF50', // Será sobrescrito dinamicamente
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  textoBotaoJogo: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botaoVoltar: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
  textoBotaoVoltar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerPerdeu: {
    alignItems: 'center',
    marginBottom: 10,
  },
  textoPerdeu: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 15,
  },
  botaoRecomecar: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textoBotaoRecomecar: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordeTexto: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
});

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

const temaClaro: TemaCores = {
  fundoPrincipal: '#f0f2f5',
  fundoCabecalho: '#6a0dad',
  textoCabecalho: '#ffffff',
  fundoCartao: '#ffffff',
  textoPrincipal: '#333333',
  textoSecundario: '#555555',
  fundoBotaoRecompensas: '#FFC107', // Será sobrescrito
  fundoAreaJogo: '#e0f7fa',
  bordaAreaJogo: '#81d4fa',
  corJogador: '#6a0dad',
  corObstaculo: '#FF5722',
  corChao: '#795548',
  fundoItemRegistro: '#f9f9f9',
  bordaItemRegistro: '#eeeeee',
};

const temaEscuro: TemaCores = {
  fundoPrincipal: '#333333',
  fundoCabecalho: '#1A2B4C',
  textoCabecalho: '#ffffff',
  fundoCartao: '#424242',
  textoPrincipal: '#e0e0e0',
  textoSecundario: '#bdbdbd',
  fundoBotaoRecompensas: '#607D8B', // Será sobrescrito
  fundoAreaJogo: '#263238',
  bordaAreaJogo: '#455A64',
  corJogador: '#1A2B4C',
  corObstaculo: '#FFAB40',
  corChao: '#4E342E',
  fundoItemRegistro: '#424242',
  bordaItemRegistro: '#555555',
};

const App: React.FC = () => {
  const [estaRegistrando, setEstaRegistrando] = useState<boolean>(false);
  const [horaInicioSono, setHoraInicioSono] = useState<Date | null>(null);
  const [registrosSono, setRegistrosSono] = useState<RegistroSono[]>([]);
  const [duracaoSonoAtual, setDuracaoSonoAtual] = useState<number>(0);
  const [telaAtiva, setTelaAtiva] = useState<'home' | 'game'>('home');
  const [temaAtual, setTemaAtual] = useState<'claro' | 'escuro'>('claro');
  const [blueLightFilter, setBlueLightFilter] = useState<boolean>(false); // Novo estado para o filtro de luz azul

  const cores = temaAtual === 'claro' ? temaClaro : temaEscuro;

  useEffect(() => {
    let intervalo: NodeJS.Timeout | null = null;
    if (estaRegistrando && horaInicioSono) {
      intervalo = setInterval(() => {
        setDuracaoSonoAtual(Math.floor((new Date().getTime() - horaInicioSono.getTime()) / 1000));
      }, 1000);
    } else if (intervalo) {
      clearInterval(intervalo);
    }
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [estaRegistrando, horaInicioSono]);

  const formatarDuracao = (totalSegundos: number): string => {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  const lidarComInicioSono = () => {
    if (!estaRegistrando) {
      setHoraInicioSono(new Date());
      setEstaRegistrando(true);
      Alert.alert('Sono Iniciado', 'Seu registro de sono foi iniciado.');
      setDuracaoSonoAtual(0);
    } else {
      Alert.alert('Aviso', 'O registro de sono já está em andamento.');
    }
  };

  const lidarComParadaSono = () => {
    if (estaRegistrando && horaInicioSono) {
      const horaFim = new Date();
      const duracaoEmMs = horaFim.getTime() - horaInicioSono.getTime();
      const duracaoEmHoras = duracaoEmMs / (1000 * 60 * 60);

      let qualidade = 'Ruim';
      if (duracaoEmHoras >= 7 && duracaoEmHoras <= 9) {
        qualidade = 'Boa';
      } else if (duracaoEmHoras > 5 && duracaoEmHoras < 7) {
        qualidade = 'Média';
      }

      const novoRegistro: RegistroSono = {
        id: Date.now().toString(),
        horaInicio: horaInicioSono,
        horaFim: horaFim,
        duracao: parseFloat(duracaoEmHoras.toFixed(2)),
        qualidade: qualidade,
      };

      setRegistrosSono((registrosAnteriores) => [novoRegistro, ...registrosAnteriores]);
      setEstaRegistrando(false);
      setHoraInicioSono(null);
      setDuracaoSonoAtual(0);
      Alert.alert('Sono Finalizado', `Você dormiu por ${novoRegistro.duracao.toFixed(2)} horas. Qualidade: ${novoRegistro.qualidade}.`);
    } else {
      Alert.alert('Aviso', 'Nenhum registro de sono ativo para parar.');
    }
  };

  const lidarComTrocaTema = () => {
    setTemaAtual(prevTema => (prevTema === 'claro' ? 'escuro' : 'claro'));
  };

  const toggleBlueLightFilter = () => { // Função para alternar o filtro de luz azul
    setBlueLightFilter(prev => !prev);
  };

  return (
    <SafeAreaView style={[estilos.container, { backgroundColor: cores.fundoPrincipal }]}>
      <View style={[estilos.cabecalho, { backgroundColor: cores.fundoCabecalho }]}>
        <Text style={[estilos.textoCabecalho, { color: cores.textoCabecalho }]}>Soninho</Text>
      </View>

      {telaAtiva === 'home' && (
        <>
          {/* Botão de tema posicionado absolutamente */}
          <TouchableOpacity
            style={[
              estilos.botaoTema,
              {
                top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 120 : 120,
                backgroundColor: temaAtual === 'claro' ? temaEscuro.fundoPrincipal : 'white', // Cor dinâmica
                borderColor: temaAtual === 'claro' ? 'white' : temaEscuro.fundoPrincipal, // Borda dinâmica
              }
            ]}
            onPress={lidarComTrocaTema}
          >
            {/* Imagem removida */}
          </TouchableOpacity>

          {/* Novo botão para filtro de luz azul */}
          <TouchableOpacity
            style={[
              estilos.botaoTema, // Reutiliza alguns estilos base do botão de tema
              {
                top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 170 : 170, // Posiciona abaixo do botão de tema
                backgroundColor: blueLightFilter ? 'white' : '#1E90FF', // Fundo branco se ativo, azul se inativo
                borderColor: blueLightFilter ? '#1E90FF' : '#FFFFFF', // Borda azul se ativo, branca se inativo
              }
            ]}
            onPress={toggleBlueLightFilter}
          >
            {/* Texto "Luz Azul" removido de dentro do botão */}
          </TouchableOpacity>

          {/* Overlay para o filtro de luz azul */}
          {blueLightFilter && (
            <View style={estilos.blueLightOverlay} pointerEvents="none" />
          )}

          <View style={[estilos.cartaoStatus, { backgroundColor: cores.fundoCartao }]}>
            <Text style={[estilos.tituloStatus, { color: cores.textoPrincipal }]}>Status Atual do Sono</Text>
            <Text style={[estilos.textoStatus, { color: cores.textoSecundario }]}>
              {estaRegistrando ? 'Registrando...' : 'Não Registrando'}
            </Text>
            {estaRegistrando && horaInicioSono && (
              <View>
                <Text style={[estilos.textoDuracao, { color: cores.corJogador }]}>
                  Duração: {formatarDuracao(duracaoSonoAtual)}
                </Text>
                <Text style={[estilos.textoHoraInicio, { color: cores.textoSecundario }]}>
                  Início: {horaInicioSono.toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>

          <View style={estilos.containerBotoes}>
            <TouchableOpacity
              style={[estilos.botao, estaRegistrando ? estilos.botaoDesabilitado : { backgroundColor: cores.fundoCabecalho }]} // Cor padronizada
              onPress={lidarComInicioSono}
              disabled={estaRegistrando}
            >
              <Text style={estilos.textoBotao}>Iniciar Sono</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[estilos.botao, !estaRegistrando ? estilos.botaoDesabilitado : estilos.botaoParar]}
              onPress={lidarComParadaSono}
              disabled={!estaRegistrando}
            >
              <Text style={estilos.textoBotao}>Parar Sono</Text>
            </TouchableOpacity>
          </View>

          <View style={[estilos.secaoHistorico, { backgroundColor: cores.fundoCartao }]}>
            <Text style={[estilos.tituloHistorico, { color: cores.textoPrincipal }]}>Histórico de Sono</Text>
            {registrosSono.length === 0 ? (
              <Text style={[estilos.textoSemRegistros, { color: cores.textoSecundario }]}>Nenhum registro de sono ainda.</Text>
            ) : (
              <ScrollView style={estilos.listaHistorico}>
                {registrosSono.map((registro) => (
                  <View key={registro.id} style={[estilos.itemRegistro, { backgroundColor: cores.fundoItemRegistro, borderColor: cores.bordaItemRegistro }]}>
                    <Text style={[estilos.textoRegistro, { color: cores.textoSecundario }]}>
                      Início: {registro.horaInicio.toLocaleString()}
                    </Text>
                    <Text style={[estilos.textoRegistro, { color: cores.textoSecundario }]}>
                      Fim: {registro.horaFim?.toLocaleString() || 'Em andamento'}
                    </Text>
                    <Text style={[estilos.textoRegistro, { color: cores.textoSecundario }]}>
                      Duração: {registro.duracao.toFixed(2)} horas
                    </Text>
                    <Text style={[estilos.qualidadeRegistro, { color: cores.corJogador }]}>
                      Qualidade: {registro.qualidade}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Botão Recompensas movido de volta para a tela 'home' */}
          <TouchableOpacity
            style={[estilos.botaoRecompensas, { backgroundColor: cores.fundoCabecalho }]} // Cor padronizada
            onPress={() => setTelaAtiva('game')}
          >
            <Text style={estilos.textoBotaoRecompensas}>Recompensas</Text>
          </TouchableOpacity>
        </>
      )}

      {telaAtiva === 'game' && (
        <GameScreen aoVoltar={() => setTelaAtiva('home')} cores={cores} />
      )}
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  textoCabecalho: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  botaoTema: {
    position: 'absolute',
    top: 120, // Ajustado para descer mais
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#000000',
  },
  // Novo estilo para o overlay do filtro de luz azul
  blueLightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 255, 0.2)', // Azul semi-transparente
    zIndex: 999, // Garante que esteja acima do conteúdo
  },
  cartaoStatus: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 3,
  },
  tituloStatus: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  textoStatus: {
    fontSize: 18,
    marginBottom: 5,
  },
  textoDuracao: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  textoHoraInicio: {
    fontSize: 16,
    marginTop: 5,
  },
  containerBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  botao: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
  // Removido background fixo para ser dinâmico
  botaoIniciar: {
    // backgroundColor: '#4CAF50',
  },
  botaoParar: {
    backgroundColor: '#F44336',
  },
  botaoDesabilitado: {
    backgroundColor: '#cccccc',
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secaoHistorico: {
    flex: 1,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 3,
  },
  tituloHistorico: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  listaHistorico: {
    flex: 1,
  },
  itemRegistro: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  textoRegistro: {
    fontSize: 16,
    marginBottom: 3,
  },
  qualidadeRegistro: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  textoSemRegistros: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  botaoRecompensas: {
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // Removido background fixo para ser dinâmico
  },
  textoBotaoRecompensas: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
