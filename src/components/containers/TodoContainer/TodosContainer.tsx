import { collection } from "firebase/firestore";
import { FC, useEffect } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import Calendar from "../Calendar/Calendar";
import Spinner from "../../view/Spinner/Spinner";
import { useAppActionCreators, useAppDispatch, useAppStore } from "../../../hooks/redux";
import Pages from "../../../models/Pages";
import classes from "./todosContainer.module.scss";
import getDayBoardTitle from "../../../utils/getDayBoardTitle";
import convertFirebaseDataToStoreData from "../../../utils/convertFirebaseDataToStoreData";
import TodosContainerProps from "./interface";
import TodoList from "../../view/TodoList/TodoList";
import useFirebaseContext from "../../../hooks/firebase";

const TodosContainer: FC<TodosContainerProps> = ({ user }) => {
  const { db } = useFirebaseContext();
  const { todosCollection, currentDate } = useAppStore();
  const { writeIdAndDate, setCollection } = useAppActionCreators();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const q = user ? collection(db, user.uid) : null;
  const [todos, loading, error] = useCollection(q);

  useEffect(() => {
    if (loading) return;
    if (error) return;
    const data = convertFirebaseDataToStoreData(todos!);
    dispatch(setCollection({ todosCollection: data }));
  }, [todos, loading, error]);

  const title = getDayBoardTitle(todosCollection, currentDate);

  const addNewTaskHandler = () => {
    const milliseconds = new Date().getTime();
    dispatch(writeIdAndDate({ id: milliseconds, date: currentDate }));
    navigate(Pages.todoPage);
  };

  if (loading) return <Spinner />;
  if (error) return <div>{error.message}</div>;
  return (
    <main className={classes.todoContainer}>
      <Calendar today={new Date()} />
      <h3 className={classes.head}>{title}</h3>
      <TodoList todos={todosCollection[currentDate] || []} user={user} />
      <button
        className={classes.addNewTodoButton}
        type="button"
        onClick={addNewTaskHandler}
        disabled={!currentDate}
      >
        + Add a New Task
      </button>
    </main>
  );
};

export default TodosContainer;
