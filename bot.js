// --- CONFIGURAÇÃO INICIAL ---
process.env.TZ = 'America/Sao_Paulo';

const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

// Objeto para guardar o estado da conversa de cada utilizador
const userStates = {};

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
    { id: "137680643", name: "Est. UERJ", lat: -22.830683, lon: -43.069901 },
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
function generateTravelTimes(path, trip) { const travelTimes = {}; const findStop = (id) => allStops.find(s => s.id === id); const splitPointId = "137680658"; const speedSegment1 = 50; const splitIndex = path.indexOf(splitPointId); if (trip.destination === 'Rio de Janeiro' && splitIndex !== -1) { let distanceSegment1 = 0; for (let i = 0; i < splitIndex; i++) { const stopA = findStop(path[i]); const stopB = findStop(path[i + 1]); distanceSegment1 += calculateDistance(stopA.lat, stopA.lon, stopB.lat, stopB.lon); } const timeToSplitPoint = (distanceSegment1 / speedSegment1) * 60; const timeSegment2 = trip.duration - timeToSplitPoint; let distanceSegment2 = 0; for (let i = splitIndex; i < path.length - 1; i++) { const stopA = findStop(path[i]); const stopB = findStop(path[i + 1]); distanceSegment2 += calculateDistance(stopA.lat, stopA.lon, stopB.lat, stopB.lon); } let cumulativeDistance = 0; travelTimes[path[0]] = 0; for (let i = 0; i < path.length - 1; i++) { const stopA = findStop(path[i]); const stopB = findStop(path[i + 1]); cumulativeDistance += calculateDistance(stopA.lat, stopA.lon, stopB.lat, stopB.lon); if (i < splitIndex) { travelTimes[path[i + 1]] = Math.round((cumulativeDistance / distanceSegment1) * timeToSplitPoint); } else { const distanceFromSplit = cumulativeDistance - distanceSegment1; const timeAfterSplit = (distanceFromSplit / distanceSegment2) * timeSegment2; travelTimes[path[i + 1]] = Math.round(timeToSplitPoint + timeAfterSplit); } } } else { return generateProportionalTravelTimes(path, trip.duration); } return travelTimes; }
function generateProportionalTravelTimes(path, totalDurationMinutes) { const travelTimes = {}; let totalDistance = 0; const distances = []; const findStop = (id) => allStops.find(s => s.id === id); for (let i = 0; i < path.length - 1; i++) { const stopA = findStop(path[i]); const stopB = findStop(path[i + 1]); if (stopA && stopB) { const distance = calculateDistance(stopA.lat, stopA.lon, stopB.lat, stopB.lon); distances.push(distance); totalDistance += distance; } } if (totalDistance === 0) return travelTimes; let cumulativeDistance = 0; travelTimes[path[0]] = 0; for (let i = 0; i < path.length - 1; i++) { cumulativeDistance += distances[i]; const time = (cumulativeDistance / totalDistance) * totalDurationMinutes; travelTimes[path[i + 1]] = Math.round(time); } return travelTimes; }
function initializeLineData() { const pathIda = ["142254614", "142254613", "142254611", "278722552", "142254608", "137680636", "137366932", "137680183", "137680184", "137680185", "137680186", "137680188", "137680637", "137680245", "137680246", "137680638", "418826665", "418826666", "418826667", "419569709", "137680643", "419571982", "419572426", "419572427", "419572428", "137680649", "137680650", "137680651", "137680652", "137680692", "137680654", "137680655", "137680656", "137680657", "137680658", "137680659", "137680793", "80888862", "80888863", "74396946", "416634036", "74396949", "111766609", "68868000", "68868001", "280645763", "280645764", "280645765", "280645766", "280645767", "68338456", "68338453", "68338451", "68338449", "68338445", "68355721"]; const pathVolta = pathIda.slice().reverse(); const tripsIda = [ { departure: "04:30", duration: 64 }, { departure: "04:38", duration: 64 }, { departure: "04:46", duration: 64 }, { departure: "04:54", duration: 64 }, { departure: "05:02", duration: 73 }, { departure: "05:10", duration: 73 }, { departure: "05:15", duration: 71 }, { departure: "05:20", duration: 71 }, { departure: "05:25", duration: 73 }, { departure: "05:30", duration: 87 }, { departure: "05:35", duration: 90 }, { departure: "05:40", duration: 90 }, { departure: "05:45", duration: 90 }, { departure: "05:50", duration: 90 }, { departure: "05:55", duration: 90 }, { departure: "06:00", duration: 107 }, { departure: "06:05", duration: 107 }, { departure: "06:10", duration: 107 }, { departure: "06:15", duration: 107 }, { departure: "06:20", duration: 107 }, { departure: "06:25", duration: 107 }, { departure: "06:30", duration: 113 }, { departure: "06:35", duration: 113 }, { departure: "06:40", duration: 113 }, { departure: "06:45", duration: 113 }, { departure: "06:51", duration: 113 }, { departure: "06:57", duration: 113 }, { departure: "07:06", duration: 115 }, { departure: "07:15", duration: 115 }, { departure: "07:25", duration: 115 }, { departure: "07:35", duration: 115 }, { departure: "07:46", duration: 115 }, { departure: "07:57", duration: 115 }, { departure: "08:08", duration: 109 }, { departure: "08:21", duration: 109 }, { departure: "08:34", duration: 109 }, { departure: "08:47", duration: 109 }, { departure: "09:00", duration: 101 }, { departure: "09:15", duration: 101 }, { departure: "09:30", duration: 96 }, { departure: "09:45", duration: 96 }, { departure: "10:00", duration: 96 }, { departure: "10:18", duration: 96 }, { departure: "10:40", duration: 90 }, { departure: "11:02", duration: 90 }, { departure: "11:25", duration: 90 }, { departure: "11:48", duration: 85 }, { departure: "12:10", duration: 85 }, { departure: "12:32", duration: 81 }, { departure: "12:54", duration: 81 }, { departure: "13:16", duration: 81 }, { departure: "13:38", duration: 76 }, { departure: "14:00", duration: 76 }, { departure: "14:20", duration: 76 }, { departure: "14:38", duration: 76 }, { departure: "14:57", duration: 76 }, { departure: "15:16", duration: 76 }, { departure: "15:35", duration: 78 }, { departure: "15:54", duration: 78 }, { departure: "16:13", duration: 78 }, { departure: "16:32", duration: 78 }, { departure: "16:51", duration: 78 }, { departure: "17:11", duration: 78 }, { departure: "17:27", duration: 78 }, { departure: "17:57", duration: 77 }, { departure: "18:27", duration: 72 }, { departure: "18:57", duration: 72 }, { departure: "19:27", duration: 62 }, { departure: "19:57", duration: 62 }, { departure: "20:29", duration: 62 }, { departure: "21:11", duration: 54 } ]; const tripsVolta = [ { departure: "05:40", duration: 60 }, { departure: "05:55", duration: 60 }, { departure: "06:07", duration: 63 }, { departure: "06:28", duration: 61 }, { departure: "06:40", duration: 66 }, { departure: "06:52", duration: 66 }, { departure: "07:02", duration: 73 }, { departure: "07:10", duration: 73 }, { departure: "07:19", duration: 73 }, { departure: "07:27", duration: 73 }, { departure: "07:36", duration: 73 }, { departure: "07:45", duration: 73 }, { departure: "07:56", duration: 73 }, { departure: "08:07", duration: 78 }, { departure: "08:22", duration: 78 }, { departure: "08:38", duration: 78 }, { departure: "08:52", duration: 78 }, { departure: "09:06", duration: 78 }, { departure: "09:20", duration: 78 }, { departure: "09:35", duration: 78 }, { departure: "09:50", duration: 78 }, { departure: "10:12", duration: 80 }, { departure: "10:34", duration: 84 }, { departure: "10:57", duration: 84 }, { departure: "11:19", duration: 85 }, { departure: "11:41", duration: 85 }, { departure: "12:03", duration: 88 }, { departure: "12:25", duration: 88 }, { departure: "12:47", duration: 88 }, { departure: "13:09", duration: 88 }, { departure: "13:31", duration: 88 }, { departure: "13:53", duration: 88 }, { departure: "14:14", duration: 89 }, { departure: "14:34", duration: 93 }, { departure: "14:47", duration: 93 }, { departure: "15:00", duration: 104 }, { departure: "15:10", duration: 106 }, { departure: "15:19", duration: 106 }, { departure: "15:28", duration: 106 }, { departure: "15:37", duration: 102 }, { departure: "15:45", duration: 120 }, { departure: "15:53", duration: 120 }, { departure: "16:01", duration: 128 }, { departure: "16:09", duration: 128 }, { departure: "16:16", duration: 128 }, { departure: "16:24", duration: 128 }, { departure: "16:32", duration: 140 }, { departure: "16:40", duration: 140 }, { departure: "16:48", duration: 140 }, { departure: "16:55", duration: 140 }, { departure: "17:03", duration: 140 }, { departure: "17:10", duration: 140 }, { departure: "17:18", duration: 140 }, { departure: "17:26", duration: 140 }, { departure: "17:34", duration: 128 }, { departure: "17:42", duration: 128 }, { departure: "17:50", duration: 128 }, { departure: "17:58", duration: 128 }, { departure: "18:06", duration: 123 }, { departure: "18:14", duration: 123 }, { departure: "18:22", duration: 120 }, { departure: "18:30", duration: 113 }, { departure: "18:39", duration: 110 }, { departure: "18:50", duration: 113 }, { departure: "18:59", duration: 108 }, { departure: "19:12", duration: 99 }, { departure: "19:25", duration: 99 }, { departure: "19:38", duration: 88 }, { departure: "19:51", duration: 90 }, { departure: "20:16", duration: 83 }, { departure: "20:41", duration: 83 }, { departure: "21:06", duration: 72 }, { departure: "21:40", duration: 66 }, { departure: "22:10", duration: 66 } ]; companyBusData.lines.ida = { line: "110 (Ida)", destination: "Rio de Janeiro", path: pathIda, trips: tripsIda }; companyBusData.lines.volta = { line: "110 (Volta)", destination: "São Gonçalo", path: pathVolta, trips: tripsVolta }; }
function calculateBusArrivalsForStop(stop, destination) { const line = destination === 'Rio de Janeiro' ? companyBusData.lines.ida : companyBusData.lines.volta; if (!line || !line.path.includes(stop.id)) return []; const now = new Date(); const dayOfWeek = now.getDay(); if (dayOfWeek === 0 || dayOfWeek === 6) { return []; } const upcomingArrivals = []; const MAX_ARRIVALS_TO_SHOW = 3; for (const trip of line.trips) { const travelTimes = generateTravelTimes(line.path, { destination: line.destination, duration: trip.duration }); const travelTime = travelTimes[stop.id]; if (typeof travelTime === 'undefined') continue; const [hours, minutes] = trip.departure.split(':').map(Number); const departureDate = new Date(); departureDate.setHours(hours, minutes, 0, 0); const arrivalDate = new Date(departureDate.getTime() + travelTime * 60000); if (arrivalDate > now) { const minutesAway = Math.round((arrivalDate.getTime() - now.getTime()) / 60000); upcomingArrivals.push({ line: line.line, destination: line.destination, minutesAway: minutesAway, arrivalTime: arrivalDate }); if (upcomingArrivals.length >= MAX_ARRIVALS_TO_SHOW) break; } } return upcomingArrivals; }

// --- LÓGICA PRINCIPAL ---

app.post('/whatsapp', async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMsg = req.body.Body.toLowerCase().trim();
    const from = req.body.From;

    let state = userStates[from] || { step: 'start' };

    let replyMessage = '';

    if (incomingMsg === 'menu' || incomingMsg === 'início' || incomingMsg === 'inicio') {
        state = { step: 'start' };
    }

    // Lida com a localização primeiro, pois não depende de estado
    if (req.body.Latitude && req.body.Longitude) {
        const { Latitude, Longitude } = req.body;
        
        let closestStop = null;
        let minDistance = Infinity;

        allStops.forEach(stop => {
            const distance = calculateDistance(Latitude, Longitude, stop.lat, stop.lon);
            if (distance < minDistance) {
                minDistance = distance;
                closestStop = stop;
            }
        });

        if (closestStop && minDistance < 2) { // Limite de 2km
            const arrivalsRio = calculateBusArrivalsForStop(closestStop, 'Rio de Janeiro');
            const arrivalsSG = calculateBusArrivalsForStop(closestStop, 'São Gonçalo');

            replyMessage = `O ponto mais próximo é *${closestStop.name}*.\n\n`;

            if (arrivalsRio.length > 0) {
                replyMessage += `*Próximos para o Rio de Janeiro:*\n`;
                arrivalsRio.forEach(bus => {
                    const formattedTime = bus.arrivalTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    replyMessage += `- Em *${bus.minutesAway} min* (às ${formattedTime})\n`;
                });
            }
             if (arrivalsSG.length > 0) {
                replyMessage += `\n*Próximos para São Gonçalo:*\n`;
                arrivalsSG.forEach(bus => {
                    const formattedTime = bus.arrivalTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    replyMessage += `- Em *${bus.minutesAway} min* (às ${formattedTime})\n`;
                });
            }
        
                    
             if (arrivalsRio.length === 0 && arrivalsSG.length === 0) {
                replyMessage += `_Nenhum ônibus previsto para este ponto nas próximas horas._`;
            }
        } else {
            replyMessage = "Não consegui encontrar um ponto a menos de 2km da sua localização.";
        }
        
        delete userStates[from]; // Reinicia a conversa
    } else {
        // Lógica de conversa baseada em estado
        switch (state.step) {
            case 'start':
                replyMessage = 'Olá! Bem-vindo ao assistente da Coesa. Como posso ajudar?\n\n*1.* Ver lista de pontos\n*2.* Enviar a minha localização';
                state.step = 'awaiting_initial_choice';
                break;

            case 'awaiting_initial_choice':
                if (incomingMsg === '1') {
                    replyMessage = 'Para qual destino deseja ver os pontos?\n*1.* Rio de Janeiro\n*2.* São Gonçalo';
                    state.step = 'awaiting_destination_for_list';
                } else if (incomingMsg === '2') {
                    replyMessage = 'Por favor, use a função do WhatsApp para compartilhar a sua localização atual.';
                    state.step = 'awaiting_location';
                } else {
                    replyMessage = 'Opção inválida. Por favor, responda com *1* ou *2*.';
                }
                break;
            
            case 'awaiting_location':
                 replyMessage = 'Ainda estou aguardando que compartilhe a sua localização. Se mudou de ideia, digite "menu" para recomeçar.';
                 break;

            case 'awaiting_destination_for_list':
                const line = incomingMsg === '1' ? companyBusData.lines.ida : (incomingMsg === '2' ? companyBusData.lines.volta : null);
                if (line) {
                    state.destination = line.destination;
                    const stopsForRoute = allStops.filter(s => line.path.includes(s.id));
                    
                    state.paginatedStops = [];
                    const pageSize = 10;
                    for (let i = 0; i < stopsForRoute.length; i += pageSize) {
                        state.paginatedStops.push(stopsForRoute.slice(i, i + pageSize));
                    }
                    state.currentPage = 0;

                    replyMessage = `Estes são os primeiros pontos para *${state.destination}*:\n\n`;
                    state.paginatedStops[0].forEach((stop, index) => {
                        replyMessage += `*${index + 1}.* ${stop.name}\n`;
                    });
                    if (state.paginatedStops.length > 1) {
                        replyMessage += `\nResponda com o *número* do ponto ou digite *"mais"* para ver os próximos.`;
                    } else {
                        replyMessage += `\nResponda com o *número* do ponto.`;
                    }
                    state.step = 'awaiting_stop_from_list';
                } else {
                    replyMessage = 'Opção inválida. Por favor, responda com *1* para Rio de Janeiro ou *2* para São Gonçalo.';
                }
                break;

            case 'awaiting_stop_from_list':
                if (incomingMsg === 'mais') {
                    state.currentPage++;
                    if (state.currentPage < state.paginatedStops.length) {
                        const pageStops = state.paginatedStops[state.currentPage];
                        const startNumber = state.currentPage * 10 + 1;
                        replyMessage = `Continuando a lista de pontos para *${state.destination}*:\n\n`;
                        pageStops.forEach((stop, index) => {
                            replyMessage += `*${startNumber + index}.* ${stop.name}\n`;
                        });
                        if (state.currentPage < state.paginatedStops.length - 1) {
                            replyMessage += `\nResponda com o *número* do ponto ou digite *"mais"* para ver os próximos.`;
                        } else {
                             replyMessage += `\nResponda com o *número* da paragem.`;
                        }
                    } else {
                        replyMessage = 'Você chegou ao fim da lista. Por favor, escolha um número ou digite "menu" para recomeçar.';
                        state.currentPage--;
                    }
                } else {
                    const choice = parseInt(incomingMsg, 10);
                    const pageSize = 10;
                    const pageIndex = Math.floor((choice - 1) / pageSize);
                    const itemIndex = (choice - 1) % pageSize;

                    if (!isNaN(choice) && state.paginatedStops && state.paginatedStops[pageIndex] && state.paginatedStops[pageIndex][itemIndex]) {
                        const selectedStop = state.paginatedStops[pageIndex][itemIndex];
                        const arrivals = calculateBusArrivalsForStop(selectedStop, state.destination);
                        
                        if (arrivals.length > 0) {
                            replyMessage = `*Próximos ônibus para ${selectedStop.name}:*\n\n`;
                            arrivals.forEach(bus => {
                                const formattedTime = bus.arrivalTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                replyMessage += `- Chega em *${bus.minutesAway} min* (às ${formattedTime})\n`;
                            });
                        } else {
                            replyMessage = `Não há ônibus programados para o ponto *${selectedStop.name}* nas próximas horas.`;
                        }
                        replyMessage += '\n\nA Coesa agradece seu contato. Digite "menu" para fazer uma nova consulta.';
                        delete userStates[from];
                    } else {
                        replyMessage = `Número inválido. Por favor, envie um número da lista que enviei ou digite "mais" para ver outras opções.`;
                    }
                }
                break;
            
            default:
                replyMessage = 'Olá! Tivemos um problema e reiniciamos a nossa conversa. Como posso ajudar?\n\n*1.* Ver lista de pontos\n*2.* Enviar a minha localização';
                state = { step: 'awaiting_initial_choice' };
                break;
        }
    }

    userStates[from] = state;

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





