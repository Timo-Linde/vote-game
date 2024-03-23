import {useState} from "react";


export default function VoteGame({games, sendJsonMessage}) {

    const [votes, setVotes] = useState(new Set())
    const maxVotes = 3;

    const sendVotes = (e) => {
        e.preventDefault();
        sendJsonMessage({
            type: "vote",
            games: Array.from(votes),
        });
    }

     return (
         <div className={"mt-2"}>
             <h2 className="text-xl2">Für Spiele Voten:</h2>
             <span className={"text-gray-500 text-sm"}>Es sind maximal 3 Votes möglich!</span>

             {games.map(game => {
                 const disabled =!votes.has(game.id) && votes.size >= maxVotes
                 return <div className="mb-[0.125rem] block min-h-[1.5rem] ps-[1.5rem]" key={game.id}>
                     <input
                         className="relative float-left -ms-[1.5rem] me-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-secondary-500 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ms-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ms-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent disabled:opacity-60"
                         type="checkbox"
                         id={`checkbox_${game.id}`}
                         checked={votes.has(game.id)}
                         disabled={disabled}
                         onChange={(e) => {
                            const newSet = new Set(votes);
                            if(newSet.has(game.id)) {
                                newSet.delete(game.id);
                            }
                            else {
                                newSet.add(game.id);
                            }
                            setVotes(newSet);
                         }}/>
                     <label
                         className={`inline-block ps-[0.15rem] hover:cursor-pointer ${disabled ? "opacity-50" : ""}`}
                         htmlFor={`checkbox_${game.id}`}
                         title={disabled ? "Es sind nur 3 gleichzeitige Votes möglich!" : ""}>
                         {game.name}
                     </label>
                 </div>
             })}
             <button
                 type="button"
                 className="mt-2 inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] disabled:opacity-70 active:bg-primary-700"
                 disabled={votes.size != maxVotes}
                 onClick={sendVotes}>
                 Voten!
             </button>
         </div>
     )
}