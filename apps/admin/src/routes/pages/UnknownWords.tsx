import { Link as RouterLink } from 'react-router-dom';

import {
  Button,
  Checkbox,
  Container,
  IconButton,
  IconButtonProps,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Tooltip,
  TooltipProps,
  Typography,
  alpha,
  styled,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PreviewIcon from '@mui/icons-material/Preview';
import { TTableData } from '@repo/backend-types/dictionary';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useSnackbar } from 'notistack';
import { EPaths } from '../enums/paths';
import {
  useGetUnknownWordsQuery,
  usePostApproveWordsMutation,
  usePostRejectWordsMutation,
} from '../../store/slices/api';

type TIconButtonWithTooltipProps = {
  tooltipProps: Omit<TooltipProps, 'children'>;
  buttonProps: Omit<IconButtonProps, 'children'>;
};

const IconButtonWithTooltip: FC<
  PropsWithChildren<TIconButtonWithTooltipProps>
> = ({ tooltipProps, buttonProps, children }) => {
  const button = <IconButton {...buttonProps}>{children}</IconButton>;

  return buttonProps.disabled ? (
    button
  ) : (
    <Tooltip {...tooltipProps}>{button}</Tooltip>
  );
};

const HeaderSpacer = styled('div')(({ theme }) => theme.mixins.toolbar);
const Main = styled('main')({
  marginTop: '1rem',
  marginBottom: '2.5rem',
});
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const rowsPerPageOptions = [5, 10, 25];

const getIdentifier = (data: TTableData): string =>
  `${data.word}-${data.language}-${data.parentId}`;

const reviewSupported = (language: string): boolean =>
  ['pl', 'fr'].indexOf(language) !== -1;

const UnknownWords: FC = () => {
  const { data = [], isLoading } = useGetUnknownWordsQuery(undefined, {
    pollingInterval: 60000,
  });

  const [approveWords, { isLoading: isApprovalInProgress }] =
    usePostApproveWordsMutation();
  const [rejectWords, { isLoading: isRejectionInProgress }] =
    usePostRejectWordsMutation();

  const loading = isApprovalInProgress || isRejectionInProgress || isLoading;

  const rows = data.reduce((acc, entry): TTableData[] => {
    return acc.concat(
      entry.words.map((word) => ({
        date: entry.date,
        parentId: entry._id,
        ...word,
      })),
    );
  }, [] as TTableData[]);

  const { enqueueSnackbar } = useSnackbar();

  // selection start
  const [selection, setSelected] = useState<readonly string[]>([]);

  const selectedSome = selection.length > 0 && selection.length < rows.length;
  const selectedAll = rows.length > 0 && selection.length === rows.length;

  const handleSelectAll = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        const newState = rows.map(
          (data) => `${data.word}-${data.language}-${data.parentId}`,
        );
        setSelected(newState);
      } else {
        setSelected([]);
      }
    },
    [rows],
  );

  const handleRowSelection = useCallback(
    (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        // select one
        setSelected((list) => {
          if (list.indexOf(id) === -1) {
            // add to the list
            return list.concat(id);
          }
          return list;
        });
      } else {
        // deselect one
        setSelected((list) => {
          const index = list.indexOf(id);
          if (index !== -1) {
            // remove from the list
            const newState = list.concat();
            newState.splice(index, 1);
            return newState;
          }
          return list;
        });
      }
    },
    [],
  );

  const entriesBySelection = useCallback((): TTableData[] => {
    console.log('entriesBySelection');
    return rows.filter((data) => {
      return selection.indexOf(getIdentifier(data)) !== -1;
    });
  }, [rows, selection]);
  // selection end
  // pagination start
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  useEffect(() => {
    if (1 + page > totalPages) {
      // we've got less pages than page we're on
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const visibleRows = React.useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rows, rowsPerPage],
  );
  // pagination end
  const handleReview = useCallback(
    (
      action:
        | 'verify'
        | 'reject'
        | 'approve'
        | 'reject-selected'
        | 'approve-selected',
      entry?: TTableData,
    ): React.MouseEventHandler<HTMLButtonElement> =>
      () => {
        console.log('action', action, entry);
        if (action === 'verify' && entry) {
          if (entry.language === 'pl') {
            // open popup with SJP
            window.open(
              `https://sjp.pwn.pl/szukaj/${entry.word.toLocaleUpperCase()}.html`,
              '_blank',
              'noopener, noreferrer',
            );
          }
          if (entry.language === 'fr') {
            window.open(
              `https://www.wordmine.info/french/word/${entry.word.toLocaleUpperCase()}`,
              '_blank',
              'noopener, noreferrer',
            );
          }
        }

        if (action !== 'verify') {
          if (action === 'approve' || action === 'approve-selected') {
            approveWords({
              words:
                action === 'approve' && entry ? [entry] : entriesBySelection(),
            })
              .unwrap()
              .then(() => {
                // success
                enqueueSnackbar(`Word(s) approved`, {
                  variant: 'success',
                });

                if (action === 'approve') {
                  // deselect one
                  setSelected((list) => {
                    const index = list.indexOf(getIdentifier(entry!));
                    if (index !== -1) {
                      // remove from the list
                      const newState = list.concat();
                      newState.splice(index, 1);
                      return newState;
                    }
                    return list;
                  });
                } else {
                  setSelected([]);
                }
              })
              .catch((error) => {
                console.error(error);
                enqueueSnackbar(`Failed to approve word(s)`, {
                  variant: 'error',
                });
              });
          }
          if (action === 'reject' || action === 'reject-selected') {
            // reject word(s)
            rejectWords({
              words:
                action === 'reject' && entry ? [entry] : entriesBySelection(),
            })
              .unwrap()
              .then(() => {
                // success
                enqueueSnackbar(`Word(s) rejectd`, {
                  variant: 'success',
                });
                if (action === 'reject') {
                  // deselect one
                  setSelected((list) => {
                    const index = list.indexOf(getIdentifier(entry!));
                    if (index !== -1) {
                      // remove from the list
                      const newState = list.concat();
                      newState.splice(index, 1);
                      return newState;
                    }
                    return list;
                  });
                } else {
                  setSelected([]);
                }
              })
              .catch((error) => {
                console.error(error);
                enqueueSnackbar(`Failed to reject word(s)`, {
                  variant: 'error',
                });
              });
          }
        }
      },
    [approveWords, enqueueSnackbar, entriesBySelection, rejectWords],
  );
  const numSelected = selection.length;
  return (
    <div className="unknown-words">
      <Container
        sx={{
          minHeight: '100vh',
        }}
      >
        <Header title="Unknown Words" />
        <HeaderSpacer />
        <Main>
          <Paper>
            <Toolbar
              sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 1 && {
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.action.activatedOpacity,
                    ),
                }),
              }}
            >
              {numSelected < 2 ? (
                <Typography
                  sx={{ flex: '1 1 100%' }}
                  variant="h6"
                  id="tableTitle"
                  component="div"
                >
                  Review unknown words
                </Typography>
              ) : (
                <>
                  <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                  >
                    {numSelected} selected
                  </Typography>
                  <Tooltip title="Reject Selected">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={handleReview('reject-selected')}
                    >
                      <ThumbDownIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Approve Selected">
                    <IconButton
                      color="success"
                      size="small"
                      onClick={handleReview('approve-selected')}
                    >
                      <ThumbUpIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Toolbar>
            <TableContainer>
              {loading && <LinearProgress />}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedAll}
                        indeterminate={selectedSome}
                        onChange={handleSelectAll}
                        inputProps={{
                          'aria-label': 'select all words',
                        }}
                        disabled={rows.length === 0 || loading}
                      />
                    </TableCell>
                    <TableCell>Word</TableCell>
                    <TableCell>Language</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((data) => {
                    const id = getIdentifier(data);
                    const isSelected = selection.indexOf(id) !== -1;
                    return (
                      <StyledTableRow key={id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={handleRowSelection(id)}
                          />
                        </TableCell>
                        <TableCell>{data.word}</TableCell>
                        <TableCell>{data.language}</TableCell>
                        <TableCell>
                          <IconButtonWithTooltip
                            tooltipProps={{
                              title: 'Verify',
                            }}
                            buttonProps={{
                              color: 'secondary',
                              size: 'small',
                              onClick: handleReview('verify', data),
                              disabled: !reviewSupported(data.language),
                            }}
                          >
                            <PreviewIcon />
                          </IconButtonWithTooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={handleReview('reject', data)}
                            >
                              <ThumbDownIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Approve">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={handleReview('approve', data)}
                            >
                              <ThumbUpIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: 53 * emptyRows,
                      }}
                    >
                      <TableCell colSpan={4} />
                    </TableRow>
                  )}
                  {!loading && rows.length === 0 && (
                    <TableRow
                      style={{
                        height: 53 * rowsPerPage,
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        sx={{
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h5">All Words reviewed</Typography>
                        <Button
                          component={RouterLink}
                          to={EPaths.ROOT}
                          sx={{ mt: 3 }}
                          variant="contained"
                        >
                          Go back to dashboard
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Main>
        <Footer />
      </Container>
    </div>
  );
};

export default UnknownWords;
