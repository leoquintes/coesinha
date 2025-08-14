// --- CONFIGURAÇÃO INICIAL ---
process.env.TZ = 'America/Sao_Paulo';

const express = require('express');
const twilio = require('twilio');
const axios = require('axios'); // Ferramenta para fazer chamadas à API

const app = express();
app.use(express.urlencoded({ extended: false }));

// Objeto para guardar o estado da conversa de cada utilizador
const userStates = {};

// --- DADOS DAS PARAGENS ---
const allStops = [
    { id: "142254614", name: "Trindade", lat: -22.807783, lon: -43.016872 },
    { id: "142254613", name: "Colégio Trindade", lat: -22.809223, lon: -43.018066 },
    { id: "142254611", name: "Drograria Lobo", lat: -22.810936, lon: -43.018948 },
    { id: "278722552", name: "Mana Junior prox. 673", lat: -22.812397, lon: -43.019691 },
    { id: "142254608", name: "Ponte Seca Ida", lat: -22.813847, lon: -43.020454 },
    { id: "137680636", name: "Pça.Nova Cidade", lat: -22.81551, lon: -43.024223 },
    { id: "137366932", name: "Bairro Antonina Ida", lat: -22.816566, lon: -43.028442 },
    { id: "137680183", name: "Cemitério São Miguel", lat: -22.817793, lon: -43.032166 },
    { id: "137680184", name: "Italínea", lat: -22.819349, lon: -43.033833 },
    { id: "137680185", name: "Igreja Nova Vida", lat: -22.820261, lon: -43.035458 },
    { id: "137680186", name: "Posto Shell", lat: -22.820635, lon: -43.038174 },
    { id: "137680188", name: "Est. 18 do Forte", lat: -22.821707, lon: -43.043636 },
    { id: "137680637", name: "Est. Clélia Nanci", lat: -22.823605, lon: -43.049149 },
    { id: "137680245", name: "Est. Tamoio", lat: -22.825718, lon: -43.051121 },
    { id: "137680246", name: "Estação Camarão", lat: -22.826925, lon: -43.053253 },
    { id: "137680638", name: "Ass. de Deus Camarão", lat: -22.8265, lon: -43.058441 },
    { id: "418826665", name: "Parada 40", lat: -22.826914, lon: -43.060925 },
    { id: "418826666", name: "Estação Mangueira", lat: -22.827888, lon: -43.063564 },
    { id: "418826667", name: "Estação Ex. Combatente", lat: -22.828655, lon: -43.065891 },
    { id: "419569709", name: "PN419571982", lat: -22.829304, lon: -43.067993 },
    { id: "137680643", name: "PN419572426", lat: -22.830683, lon: -43.069901 },
    { id: "419571982", name: "Estação Paul Leroux", lat: -22.831375, lon: -43.071941 },
    { id: "419572426", name: "Estação CIUG", lat: -22.831776, lon: -43.074184 },
    { id: "419572427", name: "Porto Velho 2", lat: -22.832531, lon: -43.0779 },
    { id: "419572428", name: "Estação Super Market", lat: -22.834637, lon: -43.083992 },
    { id: "137680649", name: "Estação Assaí", lat: -22.836649, lon: -43.087082 },
    { id: "137680650", name: "Clinica Popular", lat: -22.837624, lon: -43.089104 },
    { id: "137680651", name: "Clinica Qualimed", lat: -22.840389, lon: -43.090748 },
    { id: "137680652", name: "Auto Peças Interlagos", lat: -22.842327, lon: -43.09079 },
    { id: "137680692", name: "Cond. Parque dos Sonhos", lat: -22.844402, lon: -43.090801 },
    { id: "137680654", name: "Posto Luna", lat: -22.847874, lon: -43.092415 },
    { id: "137680655", name: "73 DP de Neves", lat: -22.848856, lon: -43.093422 },
    { id: "137680656", name: "Colégio E.Faria", lat: -22.850925, lon: -43.096245 },
    { id: "137680657", name: "Carrefour", lat: -22.852501, lon: -43.097008 },
    { id: "137680658", name: "Barreto ida", lat: -22.854599, lon: -43.097996 },
    { id: "137680659", name: "Estaleiro CBO", lat: -22.856907, lon: -43.099487 },
    { id: "137680793", name: "Subida da Ponte", lat: -22.85965, lon: -43.102459 },
    { id: "80888862", name: "Mocanguê", lat: -22.864128, lon: -43.107738 },
    { id: "80888863", name: "Rodoviária", lat: -22.877689, lon: -43.110779 },
    { id: "74396946", name: "Leopoldina", lat: -22.872974, lon: -43.133846 },
    { id: "416634036", name: "Cidade Nova Ida", lat: -22.903002, lon: -43.210297 },
    { id: "74396949", name: "Sambródomo", lat: -22.907692, lon: -43.209915 },
    { id: "111766609", name: "Terreirão do Samba", lat: -22.910084, lon: -43.205933 },
    { id: "68868000", name: "Globo", lat: -22.9086, lon: -43.197945 },
    { id: "68868001", name: "Inca", lat: -22.907984, lon: -43.195751 },
    { id: "280645763", name: "Santuário Nossa Senhora de Fatima", lat: -22.908594, lon: -43.194984 },
    { id: "280645764", name: "Acad. Brasileira de Filosofia", lat: -22.91066, lon: -43.193878 },
    { id: "280645765", name: "Andrade Lapa Hotel", lat: -22.912325, lon: -43.192371 },
    { id: "280645766", name: "Curso YES", lat: -22.91341, lon: -43.190948 },
    { id: "280645767", name: "Casa & Vídeo", lat: -22.914782, lon: -43.189049 },
    { id: "68338456", name: "Arcos da Lapa", lat: -22.914978, lon: -43.187126 },
    { id: "68338453", name: "Mém de Sá prox. 23", lat: -22.914444, lon: -43.183411 },
    { id: "68338451", name: "Passeio", lat: -22.913702, lon: -43.180862 },
    { id: "68338449", name: "Est. Salvatori", lat: -22.913645, lon: -43.179234 },
    { id: "68338445", name: "Est. Brasilância", lat: -22.912825, lon: -43.177048 },
    { id: "68355721", name: "Augusto Severo", lat: -22.916643, lon: -43.176563 }
];
const companyBusData = { stops: allStops, lines: { ida: null, volta: null } };

// --- LÓGICA DA API CITTATI ---

let cittatiToken = null;
let cittatiEmpresa = null;

async function authenticateCittati() {
    try {
        const response = await axios.post('http://servicos.cittati.com.br/WSIntegracaoCittati/Autenticacao/AutenticarUsuario', {
            usuario: process.env.CITTATI_USER,
            senha: process.env.CITTATI_PASSWORD
        });
        cittatiToken = response.data;
        cittatiEmpresa = "pedro@coesa.com";
        console.log("Autenticação na CITTATI bem-sucedida.");
        return true;
    } catch (error) {
        console.error("Erro na autenticação da CITTATI:", error.response ? error.response.data : error.message);
        cittatiToken = null;
        cittatiEmpresa = null;
        return false;
    }
}

async function getRealTimeBusLocations() {
    if (!cittatiToken) {
        const authenticated = await authenticateCittati();
        if (!authenticated) {
            throw new Error("Falha na autenticação da CITTATI.");
        }
    }

    try {
        const today = new Date();
        const dateString = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        const response = await axios.get('http://servicos.cittati.com.br/WSIntegracaoCittati/Operacional/ConsultarViagens', {
            params: {
                data: dateString,
                empresa: cittatiEmpresa,
                numerolinha: '110',
                token: cittatiToken
            }
        });
        
        return response.data.map(bus => ({
            prefixo: bus.prefixoVeiculo,
            lat: bus.latitude,
            lon: bus.longitude,
            destination: bus.sentido === 'I' ? 'Rio de Janeiro' : 'São Gonçalo'
        }));

    } catch (error) {
        console.error("Erro ao consultar viagens na CITTATI:", error.response ? error.response.data : error.message);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            cittatiToken = null;
        }
        return [];
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) { const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180; const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }

// --- LÓGICA PRINCIPAL DO BOT ---

app.post('/whatsapp', async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMsg = req.body.Body.toLowerCase().trim();
    const from = req.body.From;

    let state = userStates[from] || { step: 'start' };

    if (incomingMsg === 'menu' || incomingMsg === 'início' || incomingMsg === 'inicio') {
        state = { step: 'start' };
    }
    
    if (req.body.Latitude && req.body.Longitude) {
        const { Latitude, Longitude } = req.body;
        let replyMessage = '';
        try {
            const realTimeBuses = await getRealTimeBusLocations();
            let closestStop = null;
            let minDistance = Infinity;

            allStops.forEach(stop => {
                const distance = calculateDistance(Latitude, Longitude, stop.lat, stop.lon);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestStop = stop;
                }
            });

            if (closestStop && minDistance < 2) {
                replyMessage = `*Previsões em tempo real para a paragem mais próxima: ${closestStop.name}*\n\n`;
                
                const predictions = realTimeBuses.map(bus => {
                    const distanceToStop = calculateDistance(bus.lat, bus.lon, closestStop.lat, closestStop.lon);
                    const estimatedTimeMinutes = (distanceToStop / 30) * 60;
                    return { ...bus, minutesAway: Math.round(estimatedTimeMinutes) };
                });

                const predictionsRio = predictions.filter(p => p.destination === 'Rio de Janeiro').sort((a, b) => a.minutesAway - b.minutesAway);
                const predictionsSG = predictions.filter(p => p.destination === 'São Gonçalo').sort((a, b) => a.minutesAway - b.minutesAway);

                if (predictionsRio.length > 0) {
                    replyMessage += `*Próximo para o Rio de Janeiro:*\n`;
                    replyMessage += `- Autocarro *${predictionsRio[0].prefixo}* chega em aprox. *${predictionsRio[0].minutesAway} min*.\n`;
                }
                if (predictionsSG.length > 0) {
                    replyMessage += `\n*Próximo para São Gonçalo:*\n`;
                    replyMessage += `- Autocarro *${predictionsSG[0].prefixo}* chega em aprox. *${predictionsSG[0].minutesAway} min*.\n`;
                }
                if (predictionsRio.length === 0 && predictionsSG.length === 0) {
                    replyMessage += `_Nenhum autocarro da linha 110 parece estar próximo desta paragem no momento._`;
                }
            } else {
                replyMessage = "Não consegui encontrar uma paragem a menos de 2km da sua localização.";
            }
        } catch (error) {
            replyMessage = "Desculpe, não consegui obter a localização dos autocarros em tempo real. Por favor, tente novamente.";
        }
        twiml.message(replyMessage);
        delete userStates[from];
    } else {
        switch (state.step) {
            case 'start':
                twiml.message('Olá! Bem-vindo ao assistente da Coesa. Como posso ajudar?\n\n*1.* Consultar por Lista de Paragens\n*2.* Usar a Minha Localização');
                state.step = 'awaiting_initial_choice';
                break;

            case 'awaiting_initial_choice':
                if (incomingMsg === '1') {
                    twiml.message('Para qual destino deseja ver as paragens?\n*1.* Rio de Janeiro\n*2.* São Gonçalo');
                    state.step = 'awaiting_destination_for_list';
                } else if (incomingMsg === '2') {
                    twiml.message('Por favor, use a função do WhatsApp para partilhar a sua localização atual.');
                    state.step = 'awaiting_location';
                } else {
                    twiml.message('Opção inválida. Por favor, responda com *1* ou *2*.');
                }
                break;
            
            case 'awaiting_location':
                 twiml.message('Ainda estou a aguardar que partilhe a sua localização. Se mudou de ideias, digite "menu" para recomeçar.');
                 break;

            case 'awaiting_destination_for_list':
                 const destination = incomingMsg === '1' ? 'Rio de Janeiro' : (incomingMsg === '2' ? 'São Gonçalo' : null);
                 if (destination) {
                     state.destination = destination;
                     const stopsForRoute = allStops; // Simplificado para mostrar todas as paragens
                     
                     state.paginatedStops = [];
                     const pageSize = 10;
                     for (let i = 0; i < stopsForRoute.length; i += pageSize) {
                         state.paginatedStops.push(stopsForRoute.slice(i, i + pageSize));
                     }
                     state.currentPage = 0;
 
                     let listMessage = `Estas são as primeiras paragens para *${state.destination}*:\n\n`;
                     state.paginatedStops[0].forEach((stop, index) => {
                         listMessage += `*${index + 1}.* ${stop.name}\n`;
                     });
                     if (state.paginatedStops.length > 1) {
                         listMessage += `\nResponda com o *número* da paragem ou digite *"mais"* para ver as próximas.`;
                     } else {
                         listMessage += `\nResponda com o *número* da paragem.`;
                     }
                     twiml.message(listMessage);
                     state.step = 'awaiting_stop_from_list';
                 } else {
                     twiml.message('Opção inválida. Por favor, responda com *1* para Rio de Janeiro ou *2* para São Gonçalo.');
                 }
                 break;

            default:
                twiml.message('Olá! Tivemos um problema e reiniciámos a nossa conversa. Como posso ajudar?\n\n*1.* Ver lista de paragens\n*2.* Enviar a minha localização');
                state = { step: 'awaiting_initial_choice' };
                break;
        }
    }

    userStates[from] = state;

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});


// --- INICIA O SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor do bot a correr na porta ${PORT}`);
});
