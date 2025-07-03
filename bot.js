// --- CONFIGURAÇÃO INICIAL ---

// IMPORTANTE: Força todo o programa a usar o fuso horário do Brasil.
process.env.TZ = 'America/Sao_Paulo';

const express = require('express');
const twilio = require('twilio');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.urlencoded({ extended: false }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });


// --- DADOS E LÓGICA DE HORÁRIOS ---

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

function calculateDistance(lat1, lon1, lat2, lon2) { const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180; const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }
function generateProportionalTravelTimes(path, totalDurationMinutes) { const travelTimes = {}; let totalDistance = 0; const distances = []; const findStop = (id) => allStops.find(s => s.id === id); for (let i = 0; i < path.length - 1; i++) { const stopA = findStop(path[i]); const stopB = findStop(path[i + 1]); if (stopA && stopB) { const distance = calculateDistance(stopA.lat, stopA.lon, stopB.lat, stopB.lon); distances.push(distance); totalDistance += distance; } } if (totalDistance === 0) return travelTimes; let cumulativeDistance = 0; travelTimes[path[0]] = 0; for (let i = 0; i < path.length - 1; i++) { cumulativeDistance += distances[i]; const time = (cumulativeDistance / totalDistance) * totalDurationMinutes; travelTimes[path[i + 1]] = Math.round(time); } return travelTimes; }
function initializeLineData() { const pathIda = ["142254614", "142254613", "142254611", "278722552", "142254608", "137680636", "137366932", "137680183", "137680184", "137680185", "137680186", "137680188", "137680637", "137680245", "137680246", "137680638", "418826665", "418826666", "418826667", "419569709", "137680643", "419571982", "419572426", "419572427", "419572428", "137680649", "137680650", "137680651", "137680652", "137680692", "137680654", "137680655", "137680656", "137680657", "137680658", "137680659", "137680793", "80888862", "80888863", "74396946", "416634036", "74396949", "111766609", "68868000", "68868001", "280645763", "280645764", "280645765", "280645766", "280645767", "68338456", "68338453", "68338451", "68338449", "68338445", "68355721"]; const pathVolta = pathIda.slice().reverse(); const tripsIda = [ { departure: "04:30", duration: 64 }, { departure: "04:38", duration: 64 }, { departure: "04:46", duration: 64 }, { departure: "04:54", duration: 64 }, { departure: "05:02", duration: 73 }, { departure: "05:10", duration: 73 }, { departure: "05:15", duration: 71 }, { departure: "05:20", duration: 71 }, { departure: "05:25", duration: 73 }, { departure: "05:30", duration: 87 }, { departure: "05:35", duration: 90 }, { departure: "05:40", duration: 90 }, { departure: "05:45", duration: 90 }, { departure: "05:50", duration: 90 }, { departure: "05:55", duration: 90 }, { departure: "06:00", duration: 107 }, { departure: "06:05", duration: 107 }, { departure: "06:10", duration: 107 }, { departure: "06:15", duration: 107 }, { departure: "06:20", duration: 107 }, { departure: "06:25", duration: 107 }, { departure: "06:30", duration: 113 }, { departure: "06:35", duration: 113 }, { departure: "06:40", duration: 113 }, { departure: "06:45", duration: 113 }, { departure: "06:51", duration: 113 }, { departure: "06:57", duration: 113 }, { departure: "07:06", duration: 115 }, { departure: "07:15", duration: 115 }, { departure: "07:25", duration: 115 }, { departure: "07:35", duration: 115 }, { departure: "07:46", duration: 115 }, { departure: "07:57", duration: 115 }, { departure: "08:08", duration: 109 }, { departure: "08:21", duration: 109 }, { departure: "08:34", duration: 109 }, { departure: "08:47", duration: 109 }, { departure: "09:00", duration: 101 }, { departure: "09:15", duration: 101 }, { departure: "09:30", duration: 96 }, { departure: "09:45", duration: 96 }, { departure: "10:00", duration: 96 }, { departure: "10:18", duration: 96 }, { departure: "10:40", duration: 90 }, { departure: "11:02", duration: 90 }, { departure: "11:25", duration: 90 }, { departure: "11:48", duration: 85 }, { departure: "12:10", duration: 85 }, { departure: "12:32", duration: 81 }, { departure: "12:54", duration: 81 }, { departure: "13:16", duration: 81 }, { departure: "13:38", duration: 76 }, { departure: "14:00", duration: 76 }, { departure: "14:20", duration: 76 }, { departure: "14:38", duration: 76 }, { departure: "14:57", duration: 76 }, { departure: "15:16", duration: 76 }, { departure: "15:35", duration: 78 }, { departure: "15:54", duration: 78 }, { departure: "16:13", duration: 78 }, { departure: "16:32", duration: 78 }, { departure: "16:51", duration: 78 }, { departure: "17:11", duration: 78 }, { departure: "17:27", duration: 78 }, { departure: "17:57", duration: 77 }, { departure: "18:27", duration: 72 }, { departure: "18:57", duration: 72 }, { departure: "19:27", duration: 62 }, { departure: "19:57", duration: 62 }, { departure: "20:29", duration: 62 }, { departure: "21:11", duration: 54 } ]; const tripsVolta = [ { departure: "05:40", duration: 60 }, { departure: "05:55", duration: 60 }, { departure: "06:07", duration: 63 }, { departure: "06:28", duration: 61 }, { departure: "06:40", duration: 66 }, { departure: "06:52", duration: 66 }, { departure: "07:02", duration: 73 }, { departure: "07:10", duration: 73 }, { departure: "07:19", duration: 73 }, { departure: "07:27", duration: 73 }, { departure: "07:36", duration: 73 }, { departure: "07:45", duration: 73 }, { departure: "07:56", duration: 73 }, { departure: "08:07", duration: 78 }, { departure: "08:22", duration: 78 }, { departure: "08:38", duration: 78 }, { departure: "08:52", duration: 78 }, { departure: "09:06", duration: 78 }, { departure: "09:20", duration: 78 }, { departure: "09:35", duration: 78 }, { departure: "09:50", duration: 78 }, { departure: "10:12", duration: 80 }, { departure: "10:34", duration: 84 }, { departure: "10:57", duration: 84 }, { departure: "11:19", duration: 85 }, { departure: "11:41", duration: 85 }, { departure: "12:03", duration: 88 }, { departure: "12:25", duration: 88 }, { departure: "12:47", duration: 88 }, { departure: "13:09", duration: 88 }, { departure: "13:31", duration: 88 }, { departure: "13:53", duration: 88 }, { departure: "14:14", duration: 89 }, { departure: "14:34", duration: 93 }, { departure: "14:47", duration: 93 }, { departure: "15:00", duration: 104 }, { departure: "15:10", duration: 106 }, { departure: "15:19", duration: 106 }, { departure: "15:28", duration: 106 }, { departure: "15:37", duration: 102 }, { departure: "15:45", duration: 120 }, { departure: "15:53", duration: 120 }, { departure: "16:01", duration: 128 }, { departure: "16:09", duration: 128 }, { departure: "16:16", duration: 128 }, { departure: "16:24", duration: 128 }, { departure: "16:32", duration: 140 }, { departure: "16:40", duration: 140 }, { departure: "16:48", duration: 140 }, { departure: "16:55", duration: 140 }, { departure: "17:03", duration: 140 }, { departure: "17:10", duration: 140 }, { departure: "17:18", duration: 140 }, { departure: "17:26", duration: 140 }, { departure: "17:34", duration: 128 }, { departure: "17:42", duration: 128 }, { departure: "17:50", duration: 128 }, { departure: "17:58", duration: 128 }, { departure: "18:06", duration: 123 }, { departure: "18:14", duration: 123 }, { departure: "18:22", duration: 120 }, { departure: "18:30", duration: 113 }, { departure: "18:39", duration: 110 }, { departure: "18:50", duration: 113 }, { departure: "18:59", duration: 108 }, { departure: "19:12", duration: 99 }, { departure: "19:25", duration: 99 }, { departure: "19:38", duration: 88 }, { departure: "19:51", duration: 90 }, { departure: "20:16", duration: 83 }, { departure: "20:41", duration: 83 }, { departure: "21:06", duration: 72 }, { departure: "21:40", duration: 66 }, { departure: "22:10", duration: 66 } ]; companyBusData.lines.ida = { line: "110 (Ida)", destination: "Rio de Janeiro", path: pathIda, trips: tripsIda }; companyBusData.lines.volta = { line: "110 (Volta)", destination: "São Gonçalo", path: pathVolta, trips: tripsVolta }; }
function calculateBusArrivalsForStop(stop, destination) { const line = destination === 'Rio de Janeiro' ? companyBusData.lines.ida : companyBusData.lines.volta; if (!line || !line.path.includes(stop.id)) return []; const now = new Date(); const dayOfWeek = now.getDay(); if (dayOfWeek === 0 || dayOfWeek === 6) { return []; } const upcomingArrivals = []; const MAX_ARRIVALS_TO_SHOW = 3; for (const trip of line.trips) { const travelTimes = generateProportionalTravelTimes(line.path, trip.duration); const travelTime = travelTimes[stop.id]; if (typeof travelTime === 'undefined') continue; const [hours, minutes] = trip.departure.split(':').map(Number); const departureDate = new Date(); departureDate.setHours(hours, minutes, 0, 0); const arrivalDate = new Date(departureDate.getTime() + travelTime * 60000); if (arrivalDate > now) { const minutesAway = Math.round((arrivalDate.getTime() - now.getTime()) / 60000); upcomingArrivals.push({ line: line.line, destination: line.destination, minutesAway: minutesAway, arrivalTime: arrivalDate }); if (upcomingArrivals.length >= MAX_ARRIVALS_TO_SHOW) break; } } return upcomingArrivals; }

// --- LÓGICA PRINCIPAL DO BOT COM IA ---

async function handleIncomingMessageWithAI(incomingMsg) {
    const normalizedMsg = incomingMsg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const foundStop = allStops.find(stop => 
        stop.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedMsg)
    );

    if (foundStop) {
        const arrivalsRio = calculateBusArrivalsForStop(foundStop, 'Rio de Janeiro');
        const arrivalsSG = calculateBusArrivalsForStop(foundStop, 'São Gonçalo');
        let replyMessage = `*Previsões para o ponto: ${foundStop.name}*\n\n`;

        if (arrivalsRio.length > 0) {
            replyMessage += `*Próximos autocarros para o Rio de Janeiro:*\n`;
            arrivalsRio.forEach(bus => {
                const formattedTime = bus.arrivalTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                replyMessage += `- Chega em *${bus.minutesAway} min* (às ${formattedTime})\n`;
            });
        }
        if (arrivalsSG.length > 0) {
            replyMessage += `\n*Próximos autocarros para São Gonçalo:*\n`;
            arrivalsSG.forEach(bus => {
                const formattedTime = bus.arrivalTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                replyMessage += `- Chega em *${bus.minutesAway} min* (às ${formattedTime})\n`;
            });
        }
        if (arrivalsRio.length === 0 && arrivalsSG.length === 0) {
             replyMessage += `_Nenhum autocarro previsto para este ponto nas próximas horas._`;
        }
        return replyMessage;
    }

    try {
        const stopListForAI = allStops.map(s => s.name).join(', ');
        const prompt = `
            Você é um assistente de WhatsApp amigável e prestativo da empresa de ônibus Coesa, especialista na linha 110.
            Seu objetivo é responder a perguntas dos usuários sobre horários de ônibus.

            A lista de pontos de ônibus disponíveis é: ${stopListForAI}.

            Tarefa:
            1. Analise a mensagem do usuário: "${incomingMsg}".
            2. Se a mensagem do usuário for um pedido de horário e você conseguir identificar um nome de ponto de ônibus da lista, responda APENAS com a tag <found_stop>NOME DO PONTO</found_stop>. Exemplo: se o usuário perguntar "horário no colégio trindade", sua resposta deve ser "<found_stop>Colégio Trindade</found_stop>". Seja flexível com erros de digitação.
            3. Se a mensagem for uma saudação, uma pergunta geral (ex: "qual o preço da passagem?", "aceita riocard?") ou qualquer outra coisa que não seja um pedido de horário para um ponto específico, responda de forma conversacional e amigável. NÃO use a tag <found_stop>.
            4. Se o usuário pedir horários mas você não conseguir identificar um ponto de ônibus válido da lista, peça para ele esclarecer qual o ponto.
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response.text();

        if (aiResponse.includes('<found_stop>')) {
            const stopName = aiResponse.split('<found_stop>')[1].split('</found_stop>')[0];
            const stopData = allStops.find(s => s.name === stopName);
            if (stopData) {
                const arrivalsRio = calculateBusArrivalsForStop(stopData, 'Rio de Janeiro');
                const arrivalsSG = calculateBusArrivalsForStop(stopData, 'São Gonçalo');

                const dataForFormatting = { stopName: stopData.name, arrivalsRio, arrivalsSG };
                
                const formattingPrompt = `
                    Formate a seguinte informação de horários de ônibus em uma resposta amigável e clara para o WhatsApp.
                    Use asteriscos para negrito e itálico para ênfase.
                    Dados: ${JSON.stringify(dataForFormatting)}
                `;
                
                const finalResult = await model.generateContent(formattingPrompt);
                return await finalResult.response.text();
            }
        }
        
        return aiResponse;

    } catch (error) {
        console.error("Erro ao contactar a API do Gemini:", error);
        return "Desculpe, estou com um problema técnico no momento. Por favor, tente novamente mais tarde.";
    }
}


// --- ROTA PRINCIPAL DO WHATSAPP ---

app.post('/whatsapp', async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMsg = req.body.Body;

    const replyMessage = await handleIncomingMessageWithAI(incomingMsg);
    
    twiml.message(replyMessage);

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});


// --- INICIA O SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    initializeLineData();
    console.log(`Servidor do bot a correr na porta ${PORT}`);
});
