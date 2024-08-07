import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { DraftExpense, Value } from "../types";
import { categories } from "../data/categories"
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { ErrorMessage } from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";
import { formatCurrency } from "../helpers/intex";



export const ExpenseForm = () => {
    const [expense, setExpense] = useState<DraftExpense>({
        amount: 0,
        expenseName: '',
        category: '',
        date: new Date()
    })

    const [error, setError] = useState('')
    const [previusAmount, setPreviusAmount] = useState(0)

    const {dispatch, state, remainingBudget} = useBudget()

    useEffect(() => {
        if(state.editingId){
            const editingExpense = state.expenses.filter( currentExpense => currentExpense.id === state.editingId )[0]
            setExpense(editingExpense)
            setPreviusAmount(editingExpense.amount)
        }
    }, [state.editingId])

    const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = e.target
        const isAmountField = ['amount'].includes(name)

        setExpense({
            ...expense,
            [name] : isAmountField ? +value : value
        })
        
    }

    const handleDateChange = (value: Value) => {
        setExpense({
            ...expense,
            date: value
        })
        
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        //validar

        if(Object.values(expense).includes('')) {
            setError('error.... tiene q incluir todos los campos')
            return //esto hace q en caso de que la validacion no pase no se pasa el mensaje de todo bien
        }

        //validar q no me pase del budget
        if((expense.amount - previusAmount) > remainingBudget) {
            setError(`ese gasto se sale del presupuesto quedan  ${formatCurrency(remainingBudget +  previusAmount)}`)
            return //esto hace q en caso de que la validacion no pase no se pasa el mensaje de todo bien
        }
        
        // agregar o actualizar gasto
        if(state.editingId) {
            dispatch({type: 'update-expense', payload: {expense: {id: state.editingId, ...expense}}})
        }else {
            dispatch({type:'add-expense', payload: {expense}})
        }

        //reiniciar state 'limpiar form'
        setExpense({
            amount: 0,
            expenseName: '',
            category: '',
            date: new Date()
        })

        setPreviusAmount(0)
        
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <legend className="uppercase text-center text-2xl font-black border-b-4 border-blue-500 py-2">
                {state.editingId ? 'Guardar Cambios' : 'Nuevo Gasto'}</legend>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="expenseName"
                        className="text-xl"
                    >
                        Nombre Gastos</label>

                    <input
                        type="text"
                        id="expenseName"
                        name="expenseName"
                        placeholder="Añade el nombre del gasto"
                        className="bg-slate-100 p-2"
                        value={expense.expenseName}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="amount"
                        className="text-xl"
                    >
                        Cantidad:</label>

                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder="Añade la cantidad del gasto: ej. 300"
                        className="bg-slate-100 p-2"
                        value={expense.amount}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="category"
                        className="text-xl"
                    >
                        Categoria:</label>

                    <select
                        id="category"
                        name="category"
                        className="bg-slate-100 p-2"
                        value={expense.category}
                        onChange={handleChange}
                    >
                        <option value="">-- Seleccione --</option>
                        {categories.map(category => (
                            <option 
                                key={category.id}
                                value={category.id}
                            >{category.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="amount"
                        className="text-xl"
                    >
                        Fecha Gasto:</label>

                    <DatePicker
                        className="bg-slate-100 p-2 border-0"
                        value={expense.date}
                        onChange={handleDateChange}
                    />
                </div>

                <input
                    type="submit"
                    className="bg-blue-600 cursor-pointer w-full p-2 text-white uppercase font-bold rounded-lg"
                    value={state.editingId ? 'Actualizar Gasto' : 'Registrar Gasto'}
                />
            

        </form>
    )
}
