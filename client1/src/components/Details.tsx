import { useEffect,useState,useContext,useCallback } from 'react'
import { SocketContext } from '../context/socket';
import { username } from '../context/details';
import { Container, Input, Button, Center, Stack, Heading, Text, Alert, useDisclosure, CloseButton, AlertIcon, Box, AlertTitle, AlertDescription } from '@chakra-ui/react';

const Details = () => {
    const [recId, setRecId] = useState('');
	const {socket} = useContext(SocketContext);

    const {
		isOpen: visibleAlert,
		onClose,
		onOpen
	} = useDisclosure({ defaultIsOpen: false });
    const [alertData, setAlertData] = useState('');

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
                setAlertData('fields are empty');
                onOpen();
            }
		}else{
            setAlertData('username not set');
            onOpen();
		}
	},[socket,field1,field2,field3]);

    const handleGetDataServer = useCallback(() => {
		if(recId){
            console.log('getData',username);
			socket.emit('getData',recId);
            onOpen();
		}else{
            setAlertData('username not set')
            onOpen();
		}
	},[socket,recId,onOpen]);
    

	const handleGotData = useCallback((data:any) => {
		setAlertData(`Saved data for recId: ${recId} :-->\n ${JSON.stringify(data)}`);
        onOpen();
	},[socket,recId,onOpen]);

	const handleDataSaved = useCallback((data:any) => {
		setAlertData(`Data is saved: \n ${JSON.stringify(data)}`);
        onOpen()
	},[socket,onOpen]);
    
    return visibleAlert ? (
        <Alert
            status='info'
            variant='subtle'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            height='200px'
        >
            <CloseButton
                alignSelf='flex-end'
                position='relative'
                left={-1}
                top={-1}
                onClick={onClose}
            />
            <AlertIcon />
            <Box>
                <AlertTitle mt={4} mb={1} fontSize='lg' >Success</AlertTitle>
                <AlertDescription maxWidth='sm'>
                    {alertData}
                </AlertDescription>
            </Box>
        </Alert>
    ) : (
    <Container>
        <Center>
            <Button type="button" onClick={() => setGetData(!getData)} shadow='xl'>GET OR SAVE TOGGLE</Button>
        </Center>

        {
            (getData) ?
                (<Stack>
                    <Heading as='h3' size='md'>Get data</Heading>
                    <Input placeholder='receiver username' variant='flushed' onChange={(e) => setRecId(e.target.value)} />
                    <Button type='button' onClick={() => handleGetDataServer()}>Send</Button>
                </Stack>)
                : (<Stack>
                    <Heading as='h3' size='md'>Save data</Heading>
                    
                    <Text>field 1:</Text>
                    <Input variant='filled' shadow='xl' name='field1' id='field1' placeholder='field1' onChange={(e) => setField1(e.target.value)} />

                    <Text>field 2:</Text>
                    <Input variant='filled' shadow='xl' name='field2' id='field2' placeholder='field2' onChange={(e) => setField2(e.target.value)} />

                    <Text>field 3:</Text>
                    <Input variant='filled' shadow='xl' name='field3' id='field3' placeholder='field3' onChange={(e) => setField3(e.target.value)} />

                    <Center>
                        <Button type="button" onClick={() => handleSaveDataServer()} shadow='xl'>SAVE</Button>
                    </Center>
                </Stack>)
        }
    </Container>);
}

export default Details;