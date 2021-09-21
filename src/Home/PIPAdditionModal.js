import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FolderOpenOutlined } from '@material-ui/icons';

import {
	Grid,
	OutlinedInput,
	FormControl,
	InputAdornment,
	IconButton,
	InputLabel,
	Input,
	FormHelperText,
	Typography,
} from '@material-ui/core';
import { isNotEmpty, SlideDialogTransition } from '../commons/helpers';
import { useForm, Controller } from 'react-hook-form';

const { ipcRenderer } = window.require('electron');

export default function PIPAdditionModal({ open, handleClose }) {
	const pickPIP = ev => {
		ipcRenderer.invoke('PIP_FILE_DIALOG');
	};

	const {
		register,
		setValue,
		setError,
		errors,
		handleSubmit,
		clearErrors,
		reset,
		watch,
		control,
	} = useForm({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		defaultValues: {
			pipName: '',
			pipPath: '',
		},
	});

	const watchPipPath = watch('pipPath');

	const onSubmit = formData => {
		ipcRenderer.invoke('PIP_ADDITION', formData.pipName, formData.pipPath);
	};

	useEffect(() => {
		ipcRenderer.on(
			'PIP_FILE_DIALOG_RESULTS',
			function (ev, pipPath, dialogCancelled) {
				setValue('pipPath', pipPath);

				// if the PIP picker dialog is cancelled
				if (dialogCancelled) {
					setError('pipPath', 'Please select a PIP path');
				} else {
					clearErrors('pipPath');
				}
			},
		);

		ipcRenderer.on(
			'PIP_ADDITION_RESULTS',
			function (ev, isPIPAdded, pipNameError, pipPathError) {
				if (isPIPAdded) {
					// Close the modal
					handleClose();
					reset();
				} else {
					if (pipNameError.length) {
						setError('pipName', {
							type: 'manual',
							message: pipNameError,
						});
					} else {
						clearErrors('pipName');
					}

					if (pipPathError.length) {
						setError('pipPath', {
							type: 'manual',
							message: pipPathError,
						});
					} else {
						clearErrors('pipPath');
					}
				}
			},
		);
	}, []);

	return (
		<Dialog
			style={{ zIndex: 1500 }}
			keepMounted={true}
			disableBackdropClick={true}
			open={open}
			fullWidth={true}
			onClose={handleClose}
			TransitionComponent={SlideDialogTransition}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogTitle>
					Add a PIP path
					<Typography variant="subtitle1" color="textSecondary">
						Add a PIP path to PyManager
					</Typography>
				</DialogTitle>

				<DialogContent>
					<TextField
						label="PIP name"
						name="pipName"
						autoFocus
						error={isNotEmpty(errors.pipName)}
						helperText={errors.pipName && errors.pipName.message}
						type="text"
						color="secondary"
						variant="outlined"
						fullWidth
						inputRef={register}
					/>

					<p />

					<TextField
						label="PIP Path"
						name="pipPath"
						error={isNotEmpty(errors.pipName)}
						helperText={errors.pipName && errors.pipName.message}
						type="text"
						color="secondary"
						variant="outlined"
						inputProps={{readOnly: true}}
						fullWidth
						inputRef={register}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={pickPIP} edge="end">
										<FolderOpenOutlined />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					{/* <FormControl
						fullWidth={true}
						color="secondary"
						variant="outlined"
					>
						<InputLabel
							error={isNotEmpty(errors.pipPath)}
							htmlFor="pip-input"
							shrink={true}
						>
							PIP path
						</InputLabel>
						<OutlinedInput
							id="pip-input"
							error={isNotEmpty(errors.pipPath)}
							inputRef={register}
							name="pipPath"
						/>
						<FormHelperText
							color="secondary"
							error={isNotEmpty(errors.pipPath)}
						>
							{errors.pipPath && errors.pipPath.message}
						</FormHelperText>
					</FormControl> */}
					<p />
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="secondary">
						Cancel
					</Button>
					<Button
						// onClick={() => handleSubmit(onSubmit)}
						type="submit"
						color="secondary"
						variant="contained"
					>
						Add PIP
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
