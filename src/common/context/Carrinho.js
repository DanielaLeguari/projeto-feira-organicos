import { createContext, useState, useContext, useEffect } from 'react';
import { usePagamentoContext } from './Pagamento';
import { UsuarioContext } from './Usuario';

export const CarrinhoContext = createContext();
CarrinhoContext.displayName = "Carrinho";

export const CarrinhoProvider = ({ children }) => {
    const [carrinho, setCarrinho] = useState([]);
    const { saldo } = useContext(UsuarioContext);
    const [quantidadeProdutos, setQuantidadeProdutos] = useState(0);
    const [valorTotalCarrinho, setValorTotalCarrinho] = useState(0);

    return (
        <CarrinhoContext.Provider
            value={{
                carrinho,
                setCarrinho,
                quantidadeProdutos,
                setQuantidadeProdutos,
                setValorTotalCarrinho,
                valorTotalCarrinho,
                saldo
            }}
        >
            {children}
        </CarrinhoContext.Provider>
    )
}

export const useCarrinhoContext = () => {
    const { carrinho,
        setCarrinho,
        quantidadeProdutos,
        setQuantidadeProdutos,
        valorTotalCarrinho,
        setValorTotalCarrinho
    } = useContext(CarrinhoContext);

    const {
        formaPagamento
    } = usePagamentoContext();

    const { setSaldo } = useContext(UsuarioContext);

    const adicionarProduto = (novoProduto) => {
        const temProduto = carrinho.some(itemDoCarrinho => itemDoCarrinho.id === novoProduto.id);
        if (!temProduto) {
            novoProduto.quantidade = 1;
            return setCarrinho(carrinhoAnterior =>
                [...carrinhoAnterior, novoProduto]
            );
        }
        setCarrinho(carrinhoAnterior => carrinhoAnterior.map(itemDoCarrinho => {
            if (itemDoCarrinho.id === novoProduto.id) {
                itemDoCarrinho.quantidade += 1;
            }
            return itemDoCarrinho;
        }))
    }

    const removerProduto = (id) => {
        const produto = carrinho.find(itemDoCarrinho => itemDoCarrinho.id === id);
        const ehUltimo = produto.quantidade === 1;
        if (ehUltimo) {
            return setCarrinho(carrinhoAnterior => carrinhoAnterior.filter(itemDoCarrinho =>
                itemDoCarrinho.id !== id));
        }

        setCarrinho(carrinhoAnterior => carrinhoAnterior.map(itemDoCarrinho => {
            if (itemDoCarrinho.id === id) {
                itemDoCarrinho.quantidade -= 1;
            }
            return itemDoCarrinho;
        }))
    }

    const efetuarCompra = () => {
        setCarrinho([]);
        setSaldo(saldoAtual => saldoAtual - valorTotalCarrinho);

    }

    useEffect(() => {
        let novaQuantidade = 0, novoTotal = 0;
        for (let i = 0; i < carrinho?.length; i++) {
            novaQuantidade += carrinho[i]?.quantidade;
            novoTotal += carrinho[i]?.quantidade * carrinho[i].valor;
        }
        setQuantidadeProdutos(novaQuantidade);
        setValorTotalCarrinho(novoTotal * formaPagamento.juros);
    }, [carrinho, setQuantidadeProdutos, setValorTotalCarrinho, formaPagamento]);

    return {
        carrinho,
        setCarrinho,
        adicionarProduto,
        removerProduto,
        quantidadeProdutos,
        setQuantidadeProdutos,
        valorTotalCarrinho,
        efetuarCompra
    }
}
