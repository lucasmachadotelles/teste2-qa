import http from 'k6/http';
import { sleep, check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { Rate, Trend } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export let options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp-up inicial para 5 usuários
    { duration: '1m', target: 10 },   // Sobe para 10 usuários
    { duration: '2m', target: 15 },   // Mantém carga de 15 usuários
    { duration: '1m', target: 5 },    // Reduz para 5 usuários
    { duration: '30s', target: 0 },   // Finaliza o teste
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser menores que 2s
    http_req_failed: ['rate<0.1'],     // Taxa de erro deve ser menor que 10%
    errors: ['rate<0.1'],              // Taxa de erro customizada deve ser menor que 10%
  },
};

// URLs das APIs do The Dog API
const baseUrl = 'https://api.thedogapi.com/v1';
const breedsUrl = `${baseUrl}/breeds`;
const imagesUrl = `${baseUrl}/images/search`;

export function handleSummary(data) {
  return {
    "relatorio-teste-tecnico.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

export default function () {
  // Teste 1: Buscar lista de raças de cães
  const breedsResponse = http.get(breedsUrl);
  
  check(breedsResponse, {
    'Status da API de raças é 200': (r) => r.status === 200,
    'Response time da API de raças < 2000ms': (r) => r.timings.duration < 2000,
    'API de raças retorna JSON válido': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
    'API de raças retorna array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
    'API de raças tem pelo menos 1 raça': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data) && data.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  // Teste 2: Buscar imagens de cães
  const imagesResponse = http.get(`${imagesUrl}?limit=5`);
  
  check(imagesResponse, {
    'Status da API de imagens é 200': (r) => r.status === 200,
    'Response time da API de imagens < 2000ms': (r) => r.timings.duration < 2000,
    'API de imagens retorna JSON válido': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
    'API de imagens retorna array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
    'API de imagens tem pelo menos 1 imagem': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data) && data.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  // Teste 3: Buscar uma raça específica por ID (se disponível)
  if (breedsResponse.status === 200) {
    try {
      const breeds = JSON.parse(breedsResponse.body);
      if (breeds.length > 0) {
        const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
        const breedId = randomBreed.id;
        
        const specificBreedResponse = http.get(`${breedsUrl}/${breedId}`);
        
        check(specificBreedResponse, {
          'Status da API de raça específica é 200': (r) => r.status === 200,
          'Response time da API de raça específica < 2000ms': (r) => r.timings.duration < 2000,
          'API de raça específica retorna dados válidos': (r) => {
            try {
              const data = JSON.parse(r.body);
              return data && data.id === breedId;
            } catch (e) {
              return false;
            }
          },
        });
      }
    } catch (e) {
      console.error('Erro ao processar dados das raças:', e);
    }
  }

  // Registra métricas
  errorRate.add(breedsResponse.status !== 200 || imagesResponse.status !== 200);
  responseTime.add(breedsResponse.timings.duration);
  responseTime.add(imagesResponse.timings.duration);

  // Log de informações úteis
  if (breedsResponse.status === 200) {
    try {
      const breeds = JSON.parse(breedsResponse.body);
      console.log(`✅ Encontradas ${breeds.length} raças de cães`);
      
      if (breeds.length > 0) {
        const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
        console.log(`Raça exemplo: ${randomBreed.name} (${randomBreed.breed_group || 'N/A'})`);
      }
    } catch (e) {
      console.error('❌ Erro ao processar dados das raças:', e);
    }
  }

  if (imagesResponse.status === 200) {
    try {
      const images = JSON.parse(imagesResponse.body);
      console.log(`🖼️ Encontradas ${images.length} imagens de cães`);
    } catch (e) {
      console.error('❌ Erro ao processar dados das imagens:', e);
    }
  }

  sleep(1); // Aguarda 1s antes da próxima iteração
} 