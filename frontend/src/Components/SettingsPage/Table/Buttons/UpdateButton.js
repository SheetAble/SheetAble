import React, { useState } from 'react'
import Modal from "../../../Sidebar/Modal/Modal"
import UpdateModalContent from './UpdateModal/UpdateModalContent'
import { IconButton } from '@material-ui/core'
import SendIcon from '@mui/icons-material/Send';

export default function UpdateButton(params) {

	const [updateModal, setUpdateModal] = useState(false)

	return (
		<>
			<Modal
				title="Update User"
				onClose={() => setUpdateModal(false)}
				show={updateModal}
			>
				<UpdateModalContent userId={params.row.id}/>
			</Modal>
			<IconButton
				variant="contained"
				color="primary"
				size="small"
				
				onClick={() => {
					setUpdateModal(true)
				}}
			>
				<SendIcon />
			</IconButton>
		</>
	)
}