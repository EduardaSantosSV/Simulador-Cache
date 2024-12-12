__Trabalho de simulador de caches para a disciplina de Arquitetura e Ogranização de Computadores II, desenvolvido pelas alunas Eduarda Santos e Eduarda Louzada.__

Foi implementado um simulador de cache, que é uma parte fundamental do design de sistemas de computação. O cache é utilizado para o armazenamento temporário de dados frequentemente acessados, isso permite o acesso mais rápido quando comparado com a memória principal. 

Entrada: O simulador recebe como entrada o seguinte comando: cache_simulator nsets bsize assoc substituição flag_saida arquivo_de_entrada.
• cache_simulator - nome do arquivo de execução principal do simulador;
• nsets - número de conjuntos na cache (número total de “linhas” ou “entradas” da cache);
• bsize - tamanho do bloco em bytes;
• assoc - grau de associatividade (número de vias ou blocos que cada conjunto possui);
• substituição - política de substituição, que pode ser Random (R), FIFO (F) ou L (LRU);
• flag_saida - flag que ativa o modo padrão de saída de dados;
• arquivo_de_entrada - arquivo com os endereços para acesso à cache.

Leitura do Arquivo de Entrada: O arquivo de entrada é lido em blocos de 4 bytes. E para cada endereço lido, o código determina a tag e o índice do cache, e decide se o acesso é um hit ou miss.
Com relação aos Hits e Misses, dependendo da associatividade, o código chama o mapDireto ou mapAssociativo para verificar se o dado está no cache e, se não estiver, aplicar a política de substituição apropriada. E após processar todos os endereços, as estatísticas do desempenho do cache são impressas, inclusive a taxa de hits e misses.

As bibliotecas utilizadas foram fs(File System), na função fs.readFileSync(arquivoEntrada) é lido um arquivo de forma síncrona. Ela é utilizada para ler o arquivo que contém os endereços que serão processados pelo simulador de cache.

__Resumo das Funções e Funcionalidade__
• politicaSubstituicao: Implementa diferentes políticas de substituição de cache (Aleatória, Least Recently Used (LRU), e First-In-First-Out (FIFO)).
• imprimirDadosCache: Exibe as estatísticas de acesso ao cache, incluindo taxa de hits e misses.
• mapDireto: Simula o mapeamento direto do cache.
• mapAssociativo: Simula o mapeamento associativo do cache.
• main: Função principal que processa os argumentos de linha de comando, lê o arquivo de entrada e executa as operações de cache.