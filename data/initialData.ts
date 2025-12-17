
export const initialData = {
    users: [
        { id: '1', name: 'Admin', role: 'admin' },
        { id: '2', name: 'Encargada', role: 'user' },
    ],
    products: [
        {
            id: '1',
            name: 'Agua Mineral',
            description: 'Botellas de 500ml marca Manantial. Mantener en lugar fresco.',
            quantity: 24,
            unit: 'botellas',
            image: 'https://img.icons8.com/color/96/bottle-of-water.png',
            history: [
                { timestamp: Date.now() - 1000 * 60 * 60 * 24, amount: -2, user: 'Encargada' },
                { timestamp: Date.now() - 1000 * 60 * 60 * 48, amount: -1, user: 'Encargada' },
                { timestamp: Date.now() - 1000 * 60 * 60 * 72, amount: 24, user: 'Admin' }
            ]
        },
        {
            id: '2',
            name: 'Papel Higiénico',
            description: 'Rollos doble hoja, paquete de 12. Almacenar en el estante superior.',
            quantity: 50,
            unit: 'rollos',
            image: 'https://img.icons8.com/color/96/toilet-paper.png',
            history: [
                { timestamp: Date.now() - 1000 * 60 * 60 * 5, amount: -4, user: 'Encargada' }
            ]
        },
        {
            id: '3',
            name: 'Jabón de Manos',
            description: 'Jabón líquido aroma lavanda. Rellenar dispensadores cada semana.',
            quantity: 10,
            unit: 'piezas',
            image: 'https://img.icons8.com/color/96/soap.png',
            history: []
        },
        {
            id: '4',
            name: 'Coca Cola',
            description: 'Latas de 355ml. Solo para el frigobar de la suite principal.',
            quantity: 12,
            unit: 'latas',
            image: 'https://img.icons8.com/color/96/cola.png',
            history: []
        },
        {
            id: '5',
            name: 'Shampoo',
            description: 'Botellas pequeñas de cortesía. Verificar sellos antes de colocar.',
            quantity: 5,
            unit: 'botellas',
            image: 'https://img.icons8.com/color/96/shampoo.png',
            history: []
        },
    ]
};
