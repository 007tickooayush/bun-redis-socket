import { useEffect,useState,useContext,useCallback } from 'react'
import { SocketContext } from '../context/socket';
import { username } from '../context/details';

const Details = () => {
    const [recId, setRecId] = useState('');
	const {socket} = useContext(SocketContext);

	const [field1, setField1] = useState('');
	const [field2, setField2] = useState('');
	const [field3, setField3] = useState('');
	
	const [getData, setGetData] = useState(false);

    useEffect(() => {
        socket.on('savedData',handleDataSaved);
        socket.on('gotData',handleGotData);

        return () => {
            socket.off('savedData',handleDataSaved);
            socket.off('gotData',handleGotData);
        }
    },[socket]);

    const handleSaveDataServer = useCallback(() => {
		if(username){
            if(field1 !== '' && field2 !== '' && field3 !== ''){
                console.log('saveData',{id:username,field1,field2, field3});
                socket.emit('saveData',{id:username,field1,field2, field3});
            }else{
                alert('fields are empty');
            }
		}else{
			alert('username not set');
		}
	},[socket,field1,field2,field3]);

    const handleGetDataServer = useCallback(() => {
		if(recId){
            console.log('getData',username);
			socket.emit('getData',recId);
		}else{
			alert('username not set');
		}
	},[socket,recId]);
    

	const handleGotData = useCallback((data:any) => {
		alert(`Saved data for recId: ${recId} :-->\n ${JSON.stringify(data)}`);
	},[socket,recId]);

	const handleDataSaved = useCallback((data:any) => {
		alert(`Data is saved: \n ${JSON.stringify(data)}`);
	},[socket]);
    
    return (
        <div>
            <button type="button" onClick={() => setGetData(!getData)}>GET OR SAVE TOGGLE</button>

            {
                (getData) ?
                    (<div>
                        get data
                        <input placeholder='receiver username' onChange={(e) => setRecId(e.target.value)} />
                        {/* create button to getData */}
                        <button type='button' onClick={() => handleGetDataServer()}>send</button>
                    </div>)
                    : (<div>
                        <h2>save data</h2>
                        

                        <label htmlFor='field1'>field 1:</label>
                        <input name='field1' id='field1' placeholder='field1' onChange={(e) => setField1(e.target.value)} />

                        <label htmlFor='field2'>field 2:</label>
                        <input name='field2' id='field2' placeholder='field2' onChange={(e) => setField2(e.target.value)} />

                        <label htmlFor='field3'>field 3:</label>
                        <input name='field3' id='field3' placeholder='field3' onChange={(e) => setField3(e.target.value)} />

                        <button type="button" onClick={() => handleSaveDataServer()}>SAVE</button>
                    </div>)
            }
        </div>
    )
}

export default Details;