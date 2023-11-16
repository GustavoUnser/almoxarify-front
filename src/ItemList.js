import React, {useState, useEffect} from "react";
import {Table, Button, Form, InputGroup} from 'react-bootstrap';
import './ItemList.css';
import {labelMap} from "./utilities";

function ItemList(detections) {

    const [data, setData] = useState([]);
    const [apiData, setApiData] = useState([]);
    const [selectedQuantities, setSelectedQuantities] = useState({});

    useEffect(() => {
        const fetchData = async() => {
            const result = await fetch('http://127.0.0.1:3001/api/v1/items');
            const result_parsed = await result.json();

            const initialQuantities = {};
            result_parsed.data.forEach(item => {
                initialQuantities[item.id] = 1;
            });
            setSelectedQuantities(initialQuantities);

            return result_parsed;
        };

        const updateData = async () => {
            if(apiData.length === 0) {
                const result_api = await fetchData();
                if(result_api && result_api.data) {
                    setApiData(result_api);
                    const newData = [];
                    detections.detections.forEach(detection => {
                        if(labelMap[detection] && apiData && apiData.data.find( o => o.name === labelMap[detection]['name'])) {
                            newData.push(apiData.data.find(o => o.name === labelMap[detection]['name']));
                        }
                    })
                    setData(newData);
                }
            } else {
                const newData = [];
                detections.detections.forEach(detection => {
                    if(labelMap[detection] && apiData && apiData.data.find( o => o.name === labelMap[detection]['name'])) {
                        newData.push(apiData.data.find(o => o.name === labelMap[detection]['name']));
                    }
                })
                setData(newData);
            }
        }
        updateData();
    }, [detections])

    const resetList = () => {
        setData([]);
        setSelectedQuantities({});
        setApiData('');
      };

    const handleRemoveItem = (itemId) => {
        const updatedData = data.filter(item => item.id !== itemId);
        setData(updatedData);
    }

    const handlePostRetrieve = (items, quantities) => {
        items.forEach(item => {
            let post_params = {
                'name': item.name,
                'quantity': quantities[item.id]
            }
            fetch('http://127.0.0.1:3001/api/v1/update_item', {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json; charset=utf-8',
                }),
                body: JSON.stringify(post_params)
            })
        });

        resetList();
    }

    const handleQuantityChange = (itemId, newQuantity) => {
        setSelectedQuantities(prevQuantities => ({
            ...prevQuantities,
            [itemId]: newQuantity,
        }));
    }

    return (
        <div>
            <h1>Lista de Itens</h1>
            <Table>
                <thead>
                    <tr>
                        <td>Nome</td>
                        <td>Quantidade no estoque</td>
                        <td>Quantidade a retirar</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                {
                    data.map((item) =>
                        <tr key={item.id}>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td>
                                <Form.Control
                                    as="select"
                                    value={selectedQuantities[item.id]}
                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                    max={item.quantity}
                                >
                                    {[...Array(item.quantity + 1).keys()].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </Form.Control>
                            </td>
                            <td>
                                <Button onClick={() => handleRemoveItem(item.id)}>
                                Remover
                                </Button>
                            </td>
                        </tr>
                    )
                }
                </tbody>
            </Table>
            <input type="text" placeholder="Código de usuário"></input>
            <Button onClick={() => handlePostRetrieve(data, selectedQuantities)}>
                Confirmar retirada
            </Button>
        </div>
    )
}

export default ItemList