import { useCallback, useEffect, useState } from 'react';
import ValidateView from './ValidateView';
import useAxios from 'axios-hooks';
import Api from '../../../apis/index';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Folder } from '../../../components/common/Widget/FolderTree';

const apiSetting = new Api();

function ValidateContainer() {
    const router = useRouter();
    const [mode, setMode] = useState<'view' | 'move'>('view');
    const [movingDest, setMovingDest] = useState<Folder | null>(null);
    const [documentPath, setDocumentPath] = useState<{ id: string | null; name: string }[]>([
        { id: null, name: 'Root' }
    ]);
    const [
        {
            data: latestPredictionData,
            loading: latestPredictionLoading,
            error: latestPredictionError,
            response: latestPredictionResponse
        },
        getAndPredictLatestUploadedDocument
    ] = useAxios(apiSetting.Document.getAndPredictLatestUploadedDocument(), {
        manual: true
    });

    const [
        {
            data: confirmDocumentData,
            loading: confirmDocumentLoading,
            error: confirmDocumentError,
            response: confirmDocumentResponse
        },
        confirmDocument
    ] = useAxios(apiSetting.Classification.confirmDocument(), { manual: true });

    const [
        {
            data: allLabelsData,
            loading: allLabelsLoading,
            error: allLabelsError,
            response: allLabelsResponse
        },
        getAllTags
    ] = useAxios(apiSetting.Tag.getAllTags(), {
        manual: false
    });

    const [
        {
            data: newLabelData,
            loading: newLabelLoading,
            error: newLabelError,
            response: newLabelResponse
        },
        addNewTag
    ] = useAxios(apiSetting.Tag.addNewTag(), {
        manual: true
    });

    const [{ data: showFolderAncestorsData }, showFolderAncestors] = useAxios({}, { manual: true });
    const [{ data: updateDocumentByIdData }, updateDocumentById] = useAxios({}, { manual: true });

    const confirmDocumentFormik = useFormik({
        initialValues: {
            document_id: null,
            tag_id: null
        },
        onSubmit: async (values) => {
            let res = await confirmDocument({
                data: {
                    ...values
                }
            });
            if (res.data.success === true) {
                alert('Document Confirmed!');
                await getAndPredictLatestUploadedDocument();
            }
        }
    });

    const addNewTagFormik = useFormik({
        initialValues: {
            name: null
        },
        onSubmit: async (values) => {
            let res = await addNewTag({
                data: {
                    ...values
                }
            });
            await getAllTags();
            if (res.data.success) {
                alert('新類型已新增！');
                await getAndPredictLatestUploadedDocument();
            } else if (res.data.success === false) {
                alert('新類型已存在！');
            }
        }
    });

    const handleMove = useCallback(
        async (document_id: string, folder_id: string) => {
            const res = await updateDocumentById(
                apiSetting.Document.updateDocumentById(document_id, folder_id)
            );
            if (res.data?.success) {
                alert('移動成功');
                router.reload();
            } else {
                alert('發生錯誤');
            }
        },
        [router, updateDocumentById]
    );

    useEffect(() => {
        axios.defaults.headers.common['authorization'] =
            localStorage.getItem('authorization') || '';
        getAndPredictLatestUploadedDocument();
    }, [getAndPredictLatestUploadedDocument]);

    useEffect(() => {
        if (latestPredictionData?.prediction?.document?.id)
            showFolderAncestors(
                apiSetting.Folders.showFolderAncestors(
                    latestPredictionData.prediction.document.folder_id
                )
            );
    }, [latestPredictionData, showFolderAncestors]);

    useEffect(() => {
        if (showFolderAncestorsData?.success) {
            setDocumentPath((prevState) => {
                return [...prevState, ...showFolderAncestorsData.ancestors.slice().reverse()];
            });
        }
    }, [showFolderAncestorsData]);

    useEffect(() => {
        console.log(latestPredictionData);
        if (
            latestPredictionData &&
            latestPredictionData.prediction &&
            latestPredictionData.success == true
        ) {
            confirmDocumentFormik.setFieldValue(
                'document_id',
                latestPredictionData.prediction.document.id
            );
            confirmDocumentFormik.setFieldValue('tag_id', latestPredictionData.prediction.tag.id);
        } else if (latestPredictionData && latestPredictionData.success === false) {
            alert('沒有文件需要驗證');
            router.push('/classification');
        }
    }, [router, latestPredictionData]);
    return (
        <>
            <ValidateView
                {...{
                    latestPredictionData,
                    confirmDocumentFormik,
                    addNewTagFormik,
                    allLabelsData,
                    mode,
                    setMode,
                    movingDest,
                    setMovingDest,
                    handleMove,
                    showFolderAncestorsData,
                    documentPath
                }}
            />
        </>
    );
}

export default ValidateContainer;
