const fs = require('fs');

function politicaSubstituicao(subst, indiceInicial, indiceFinal, ordemCache, ordemAcesso, etiquetaCache, etiqueta, fifoIndex) {
    let indiceCache;

    if (subst === "R") {
        indiceCache = Math.floor(Math.random() * (indiceFinal - indiceInicial)) + indiceInicial;
    } else if (subst === "L") {
        // Implementação para Least Recently Used (não está relacionada à FIFO)
        indiceCache = indiceInicial + ordemCache.slice(indiceInicial, indiceFinal).indexOf(Math.min(...ordemCache.slice(indiceInicial, indiceFinal)));
        ordemCache[indiceCache] = ordemAcesso;  
    } else if (subst === "F") {
        // FIFO: substituir o bloco mais antigo
        indiceCache = fifoIndex % (indiceFinal - indiceInicial) + indiceInicial;  // Aqui estamos usando a fila
        fifoIndex++; // Incrementar o índice para a próxima substituição
        ordemCache[indiceCache] = ordemAcesso;
    } else {
        console.log("Política de substituição inválida!");
    }

    etiquetaCache[indiceCache] = etiqueta;
    return { ordemCache, etiquetaCache, fifoIndex }; // Retorne o fifoIndex atualizado
}


function imprimirDadosCache(dados) {
    const { hit, numeroAcesso, miss, missCompulsorio, missCapacidade, missConflito, flagSaida } = dados;
    const taxaHit = (hit / numeroAcesso).toFixed(4);
    const taxaMiss = (miss / numeroAcesso).toFixed(4);
    const taxaMissCompulsorio = (missCompulsorio / miss || 0).toFixed(4);
    const taxaMissCapacidade = (missCapacidade / miss || 0).toFixed(4);
    const taxaMissConflito = (missConflito / miss || 0).toFixed(4);

    if (flagSaida === 0) {
        console.log("Número de acessos: ", numeroAcesso);
        console.log(`Taxa de hits: ${taxaHit} \tNúmero de hits: ${hit}`);
        console.log(`Taxa de misses: ${taxaMiss} \tNúmero de misses: ${miss}`);
        console.log(`Taxa de misses compulsório: ${taxaMissCompulsorio} \tNúmero de misses compulsório: ${missCompulsorio}`);
        console.log(`Taxa de misses de capacidade: ${taxaMissCapacidade} \tNúmero de misses de capacidade: ${missCapacidade}`);
        console.log(`Taxa de misses de conflito: ${taxaMissConflito} \tNúmero de misses de conflito: ${missConflito}`);
    } else if (flagSaida === 1) {
        console.log(numeroAcesso, taxaHit, taxaMiss, taxaMissCompulsorio, taxaMissCapacidade, taxaMissConflito);
    } else {
        console.log("Flag de saída inválida!");
    }
}

function mapDireto(indiceCache, valorCache, etiquetaCache, etiqueta, stats, subst, ordemCache, ordemAcesso) {

    if (valorCache[indiceCache] === 1 && etiquetaCache[indiceCache] === etiqueta) {
        stats.hit++;
        ordemCache[indiceCache] = ordemAcesso;  
    } else {
        stats.miss++;
        if (valorCache[indiceCache] === 0) {
            stats.missCompulsorio++;
            valorCache[indiceCache] = 1;
            etiquetaCache[indiceCache] = etiqueta;
            ordemCache[indiceCache] = ordemAcesso;
        } else if (etiquetaCache[indiceCache] !== etiqueta) {
            stats.missConflito++;
            valorCache[indiceCache] = 1;
            etiquetaCache[indiceCache] = etiqueta;
            ordemCache[indiceCache] = ordemAcesso;
        } else if (!valorCache.includes(0)) {
            stats.missCapacidade++;
            const resultado = politicaSubstituicao(subst, 0, nsets, ordemCache, ordemAcesso, etiquetaCache, etiqueta);
            ordemCache = resultado.ordemCache;
            etiquetaCache = resultado.etiquetaCache;
        }
    }

    return { valorCache, etiquetaCache, stats };
}

function mapAssociativo(indiceInicial, indiceFinal, valorCache, etiquetaCache, etiqueta, ordemCache, ordemAcesso, subst, fifoIndex) {
    let stats = { hit: 0, miss: 0, missCompulsorio: 0, missConflito: 0, missCapacidade: 0 };

    for (let i = indiceInicial; i < indiceFinal; i++) {
        if (valorCache[i] === 1 && etiquetaCache[i] === etiqueta) {
            stats.hit++;
            ordemCache[i] = ordemAcesso;  
            return { stats, fifoIndex }; // Retornar fifoIndex também
        }
    }

    stats.miss++;
    if (valorCache.slice(indiceInicial, indiceFinal).includes(0)) {
        stats.missCompulsorio++;
        for (let i = indiceInicial; i < indiceFinal; i++) {
            if (valorCache[i] === 0) {
                valorCache[i] = 1;
                etiquetaCache[i] = etiqueta;
                ordemCache[i] = ordemAcesso;  
                return { stats, fifoIndex }; // Retornar fifoIndex também
            }
        }
    } else if (valorCache.includes(0)) {
        stats.missConflito++;
        const resultado = politicaSubstituicao(subst, indiceInicial, indiceFinal, ordemCache, ordemAcesso, etiquetaCache, etiqueta, fifoIndex);
        ordemCache = resultado.ordemCache;
        etiquetaCache = resultado.etiquetaCache;
        fifoIndex = resultado.fifoIndex; // Atualizar fifoIndex
    } else {
        stats.missCapacidade++;
        const resultado = politicaSubstituicao(subst, indiceInicial, indiceFinal, ordemCache, ordemAcesso, etiquetaCache, etiqueta, fifoIndex);
        ordemCache = resultado.ordemCache;
        etiquetaCache = resultado.etiquetaCache;
        fifoIndex = resultado.fifoIndex; // Atualizar fifoIndex
    }

    return { stats, fifoIndex }; // Retornar fifoIndex ao final
}


function main() {
    if (process.argv.length !== 8) {
        console.log("Número de argumentos incorreto. Utilize:");
        console.log("node cache_simulator.js <nsets> <bsize> <assoc> <substituição> <flag_saida> arquivo_de_entrada");
        process.exit(1);
    }

    const nsets = parseInt(process.argv[2]);
    const bsize = parseInt(process.argv[3]);
    const assoc = parseInt(process.argv[4]);
    const subst = process.argv[5];
    const flagSaida = parseInt(process.argv[6]);
    const arquivoEntrada = process.argv[7];

    let valorCache = Array(nsets * assoc).fill(0);
    let etiquetaCache = Array(nsets * assoc).fill(-1);
    let ordemCache = Array(nsets * assoc).fill(0);
    let stats = { numeroAcesso: 0, hit: 0, miss: 0, missCompulsorio: 0, missCapacidade: 0, missConflito: 0 };
    
 
    const nBitsOffset = Math.log2(bsize);
    const nBitsIndex = Math.log2(nsets);
    const nBitsTag = 32 - nBitsOffset - nBitsIndex;
    let fifoIndex = 0;
 
    const buffer = fs.readFileSync(arquivoEntrada);
    for (let i = 0; i < buffer.length; i += 4) {
        const endereco = buffer.readUInt32BE(i);
        stats.numeroAcesso++;
        const etiqueta = endereco >> (nBitsOffset + nBitsIndex);
        const indice = (endereco >> nBitsOffset) & ((2 ** nBitsIndex) - 1);

        if (assoc === 1) {
            const ordemAcesso = stats.numeroAcesso;
            const resultado = mapDireto(indice, valorCache, etiquetaCache, etiqueta, stats, subst, ordemCache, ordemAcesso);
            valorCache = resultado.valorCache;
            etiquetaCache = resultado.etiquetaCache;
            stats = resultado.stats;
        } else {
            const indiceInicio = indice * assoc;
            const indiceFim = indiceInicio + assoc;
            const ordemAcesso = stats.numeroAcesso;
            const resultado = mapAssociativo(indiceInicio, indiceFim, valorCache, etiquetaCache, etiqueta, ordemCache, ordemAcesso, subst, fifoIndex);
            stats.hit += resultado.stats.hit;
            stats.miss += resultado.stats.miss;
            stats.missCompulsorio += resultado.stats.missCompulsorio;
            stats.missConflito += resultado.stats.missConflito;
            stats.missCapacidade += resultado.stats.missCapacidade;
            fifoIndex = resultado.fifoIndex; // Atualizar fifoIndex
        }
    }

    imprimirDadosCache({ hit: stats.hit, numeroAcesso: stats.numeroAcesso, miss: stats.miss, missCompulsorio: stats.missCompulsorio, missCapacidade: stats.missCapacidade, missConflito: stats.missConflito, flagSaida });
}
 
main();
