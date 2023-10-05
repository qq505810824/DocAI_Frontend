import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { CalendarIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import Dropdowns from './Dropdowns';

interface TaskRowProps {
    task: any;
    completeTask: any;
    updateTask: any;
    removeTask: any;
    visiableMore?: boolean;
}

export default function TaskRow(props: TaskRowProps) {
    const { task, completeTask, updateTask, removeTask, visiableMore = true } = props;
    const [visiable, setVisiable] = useState(false);
    const [overflow, setOverflow] = useState(false);
    const content = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setVisiable(visiableMore)
    }, [visiableMore])
    function useWinSize() {
        const [size, setSize] = useState({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        });

        const onResize = useCallback(() => {
            setSize({
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            });
        }, []);
        useEffect(() => {
            window.addEventListener('resize', onResize);
            return () => {
                window.removeEventListener('resize', onResize);
            };
        }, []);

        return size;
    }

    const size = useWinSize();

    useEffect(() => {
        if (content.current) {
            setOverflow(content.current.scrollWidth > content.current.clientWidth);
        }
    }, [size]);

    const completed = () => {
        // task.is_completed = !task.is_completed;
        // completeTask({
        //     id: task?.id,
        //     is_completed: task.is_completed
        // });
    };

    return (
        <>
            <div className="flex flex-row px-4 py-2 items-start cursor-pointer  border rounded-md my-2  w-full ">
                <div className=" flex-row items-center">
                    {task?.status == 'completed' &&
                        <input
                            type={'radio'}
                            className=" w-4 h-4  mt-1 cursor-pointer "
                            defaultChecked={true}

                        />
                    }
                    {task?.status == 'pending' &&
                        <input
                            type={'radio'}
                            className=" w-4 h-4  mt-1 cursor-pointer "
                            onClick={completeTask}
                        />
                    }
                </div>
                <div
                    ref={content}
                    className={
                        visiable
                            ? `ml-2 break-words break-all`
                            : `ml-2  overflow-hidden text-ellipsis whitespace-nowrap `
                    }
                    onClick={() => {
                        setVisiable(!visiable);
                    }}
                >
                    <span
                        className={`text-md ml-2  break-words break-all  text-black `}
                    >
                        {task?.name}
                    </span>
                    <br />
                    <span className="text-sm ml-2  text-gray-400 ">{task?.meta?.description}</span>
                    <div className="flex flex-row ml-2 items-center">
                        <label className=" text-blue-500">@{task?.assignee_id}</label>
                        {task?.deadline && (
                            <div className="flex flex-row ml-4">
                                <CalendarIcon className="w-4 text-yellow-400" />
                                <p className="text-sm ml-2   text-yellow-400 ">
                                    {moment(task?.deadline).format('YYYY-MM-DD')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className=" flex flex-1 ml-2 items-end justify-end ">
                    {visiable && overflow ? (
                        <ChevronUpIcon
                            className="w-5 h-5 mx-2 text-gray-500 "
                            onClick={() => {
                                setVisiable(!visiable);
                            }}
                        />
                    ) : overflow ? (
                        <ChevronDownIcon
                            className="w-5 h-5 mx-2 text-gray-500 "
                            onClick={() => {
                                setVisiable(!visiable);
                            }}
                        />
                    ) : null}
                    {visiableMore &&
                        <Dropdowns
                            type={'type'}
                            is_completed={task?.is_completed}
                            rename={updateTask}
                            remove={removeTask}
                            move={() => {
                                alert('未做');
                            }}
                        />
                    }
                </div>
            </div>
        </>
    );
}
