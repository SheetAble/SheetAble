import React, { useState } from 'react'
import Modal from "../../../Sidebar/Modal/Modal"
import UpdateModalContent from './UpdateModal/UpdateModalContent'
import { IconButton } from '@material-ui/core'
import SyncAltIcon from '@mui/icons-material/SyncAlt';

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
				style={{color: "#5865f2"}}
				onClick={() => {
					setUpdateModal(true)
				}}
			>
				<SyncAltIcon />
			</IconButton>
		</>
	)
}