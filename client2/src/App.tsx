// import { useEffect, useState } from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { SocketContext } from './context/socket'
import { UserContext, username } from './context/details';
import Details from './components/Details';
import { Button, Center, Container, HStack, Heading, Highlight, Input, Stack, Text } from '@chakra-ui/react';

function App() {

	const [recGetUser, setRecGetUser] = useState('');
	const [msg, setMsg] = useState('');
	// const [recId, setRecId] = useState('');
	const {socket} = useContext(SocketContext);

	const handleUserAdded = useCallback((data: any) =>{
		console.log('newAdded event::',data);
	},[socket]);


	const handleSentUser = useCallback((data:any) => {
		console.log('sentUser event::',data)
		alert(`Got user socket: ${data.socket}`)
	},
	[socket]);
	
	const handleGetUser = useCallback((userRec:any) => {
		socket.emit('getUser',{id: userRec})
	},[socket]);

	useEffect(()=>{
		// setUsername(generateUsername());
		socket.emit('addNew',{id: username});

		socket.on('newAdded',handleUserAdded);
		socket.on('sentUser',handleSentUser);

		return () =>{
			socket.off('newAdded',handleUserAdded);
			socket.off('sentUser',handleSentUser);
		};
	},[socket])

	return (
		<UserContext.Provider value={{username}}>
			<Center>
				<Container>
					<Stack>
						<Heading as='h1' size='2xl'>App Component</Heading>
						
						<HStack>
							<Heading as='h3' size='lg'>username:</Heading>
							{/* <Heading size='md'>  */}
								<Highlight query={'spotlight'}>{username}</Highlight>
							{/* </Heading> */}
						</HStack>

						<Stack>
							<Heading as='h3' size='md'>Get User Details</Heading>
							<HStack>
								<Input placeholder='receiver userame' variant='filled' shadow='xl' onChange={(e) => setRecGetUser(e.target.value)} />
								<Button type='button' shadow='xl' onClick={() => handleGetUser(recGetUser)}>Get Details</Button>
							</HStack>
						</Stack>

						<Details />
					</Stack>
				</Container>
			</Center>
		</UserContext.Provider>

	)
}

export default App