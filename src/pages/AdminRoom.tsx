import { useState,  Fragment } from "react";
import { useHistory, useParams } from 'react-router-dom'
import Modal from 'react-modal'

import { useRoom } from "../hooks/useRoom"
import { Button } from "../components/Button/Index"

import { RoomCode } from "../components/RoomCode/Index"
import { Question } from "../components/Question/Index"
import { database } from "../services/firebase"

import logoImg from '../assets/images/logo.svg'
import deleteImg from '../assets/images/delete.svg'
import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'

import '../styles/room.scss'

type RoomParams ={
    id: string
}

export function AdminRoom() {
    const history = useHistory()
    const params = useParams<RoomParams>()
    const [roomModalIsVisible, setRoomModalIsVisible] = useState(false)
    const [modalQuestionIsVisible, setQuestionModalIsVisible] = useState(false)
    const roomId = params.id
    const { title, questions } = useRoom(roomId)
    async function handleEndRoom() {
        await database.ref(`rooms/${roomId}`).update({
            closedAt: new Date(),
        })
        history.push('/')
    }
    async function handleDeleteQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
        setQuestionModalIsVisible(false)
    }
    async function handleCheckQuestionAsAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true,
        })
    }
    async function handleHighlightQuestion(questionId: string){
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlighted: true,
        })
    }
    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="LetMwAsk" />
                    <div>
                        <RoomCode code={roomId} />
                        <>
                            <Button
                                isOutlined
                                onClick={() => setRoomModalIsVisible(true)}
                            >Encerrar sala</Button>
                            <Modal
                                className="room-modal"
                                ariaHideApp={false}
                                isOpen={roomModalIsVisible}
                                onRequestClose={() => setRoomModalIsVisible(false)}
                            ><h2>Quer mesmo encerrar a sala?</h2>
                                <>
                                    <Button
                                        isOutlined
                                        onClick={handleEndRoom}
                                    >Encerrar
                                    </Button>
                                    <Button
                                        isOutlined
                                        onClick={() => setRoomModalIsVisible(false)}
                                    >Cancelar
                                    </Button>
                                </>
                            </Modal>
                        </>
                    </div>
                </div>
            </header>
            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && <span>{questions.length}
                        { questions.length === 1 ? ' pergunta' : ' perguntas' }</span>
                    }
                </div>
                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Fragment key={question.id}>
                                <Question
                                    content={question.content}
                                    author={question.author}
                                    isAnswered={question.isAnswered}
                                    isHighlighted={question.isHighlighted}
                                >
                                    {!question.isAnswered && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                            >
                                                <img src={checkImg} alt="Marcar pergunta como respondida"/>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleHighlightQuestion(question.id)}
                                            >
                                                <img src={answerImg} alt="Destacar pergunta"/>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setQuestionModalIsVisible(true)}
                                    >
                                        <img src={deleteImg} alt="Remover pergunta"/>
                                    </button>
                                </Question>
                                <Modal
                                    isOpen={modalQuestionIsVisible}
                                    onRequestClose={() => setQuestionModalIsVisible(false)}
                                >
                                    <>
                                        <Button
                                            isOutlined
                                            onClick={() => handleDeleteQuestion(question.id)}
                                        >Deletar
                                        </Button>
                                        <Button
                                            isOutlined
                                            onClick={() => setQuestionModalIsVisible(false)}
                                        >Fechar
                                        </Button>
                                    </>
                                </Modal>
                            </Fragment>
                        )
                    })}
                </div>
            </main>
        </div>
)
}