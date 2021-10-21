import React, { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { Link as RouterLink } from "react-router-dom";
import { Container, FormControl, FormControlLabel, FormLabel, InputAdornment, OutlinedInput, Typography, Box, CardMedia, CardActionArea, RadioGroup, Checkbox,
  TableContainer,  Table, TableBody, TableCell, TableHead, TableRow, Avatar
 } from "@material-ui/core";
import { Autocomplete } from '@material-ui/lab'
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import { Link } from "react-router-dom";
import { toBech32Address } from "@zilliqa-js/crypto"
import cls from "classnames";
import { useSelector } from "react-redux"
import { ArkClient } from "core/utilities"
import { AppTheme } from "app/theme/types"
import ArkPage from "app/layouts/ArkPage"
import { getBlockchain } from "app/saga/selectors";
import { CurrencyLogo } from "app/components";
import { ReactComponent as CheckedIcon } from "./checked-icon.svg"
import { ReactComponent as VerifiedBadge } from "./verified-badge.svg"

interface SearchFilters {
  [prop: string]: boolean;
}
const TEMP_BEAR_AVATAR_URL =
  "https://pbs.twimg.com/profile_images/1432977604563193858/z01O7Sey_400x400.jpg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
    "& .MuiRadio-colorSecondary.Mui-checked": {
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    marginTop: theme.spacing(2),
    borderColor: "rgba(222, 255, 255, 0.5)",
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
  },
  formControl: {
    flexDirection: "row",
  },
  formLabel: {
    alignSelf: "center",
    fontWeight: 700,
    marginRight: theme.spacing(2),
    "&.Mui-focused": {
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  formControlLabel: {
    "& .MuiTypography-root": {
      fontFamily: "'Raleway', sans-serif",
      fontWeight: 900,
    },
  },
  radioGroup: {
    flexWrap: "nowrap",
  },
  radioButton: {
    padding: "6px",
    "&:hover": {
      background: "transparent!important",
    },
  },
  titleDescription: {
    color: "#26D4FF",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
  image: {
    borderRadius: "0px 0px 10px 10px!important",
  },
  headerCell: {
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    borderBottom: "1px solid #29475A",
    padding: "8px 16px",
    fontFamily: 'Avenir Next',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.2px',
    opacity: 0.5
  },
  tableRow: {
    animation: `$slideEffect 1000ms linear`,
    padding: 12,
    height: 72,
  },
  "@keyframes slideEffect": {
    "100%": { transform: " translateY(0%)" }
  },
  // TODO: reduce this
  bodyCell: {
    extend: 'text',
    padding: "8px 16px",
    maxWidth: 200,
    margin: 0,
    borderTop: "1px solid rgba(222, 255, 255, 0.5)",
    borderBottom: "1px solid rgba(222, 255, 255, 0.5)",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  percentCell: {
    extend: 'text',
    padding: "8px 16px",
    maxWidth: 200,
    margin: 0,
    borderTop: "1px solid rgba(222, 255, 255, 0.5)",
    borderBottom: "1px solid rgba(222, 255, 255, 0.5)",
    fontSize: 18,
    lineHeight: "16px",
    color: '#00FFB0',
  },
  numberCell: {
    extend: 'text',
    padding: "8px 16px",
    maxWidth: 200,
    margin: 0,
    borderTop: "1px solid rgba(222, 255, 255, 0.5)",
    borderBottom: "1px solid rgba(222, 255, 255, 0.5)",
    fontSize: 18,
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  firstCell: {
    borderLeft: "1px solid rgba(222, 255, 255, 0.5)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastCell: {
    borderRight: "1px solid rgba(222, 255, 255, 0.5)",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  amount: {
    fontWeight: 800,
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: '0px 12px',
  },
  currencyLogo: {
    marginRight: theme.spacing(1),
    height: 20,
    "& svg": {
      display: "block",
    }
  },
  avatar: {
    height: 40,
    width: 40,
  },
  rowText: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "18px",
    lineHeight: "16px",
    color: theme.palette.text?.primary,
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "20px",
    height: "20px",
    verticalAlign: "text-top",
  },
  index: {
    margin: "0px 14px",
  },
  collectionTitle: {
    marginLeft: "14px",
  },
  isNegative: {
    color: theme.palette.error.main,
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
      width: 605,
      borderRadius: "12px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.palette.type === "dark" ? "#29475A" : "#D4FFF2",
      overflow: "hidden",
      marginTop: 8
    },
  },
}));

const SEARCH_FILTERS = ["profile", "artist", "collection"]

type CellAligns = "right" | "left" | "inherit" | "center" | "justify" | undefined;
interface HeadersProp {
  align: CellAligns;
  value: string;
}
const HEADERS: HeadersProp[] = [
  { align: "left", value: "Collection" },
  { align: "center", value: "Volume" },
  { align: "center", value: "Floor" },
  { align: "center", value: "24 Hour %" },
  { align: "center", value: "7 Day %" },
  { align: "center", value: "Owners" },
  { align: "center", value: "Collection Size" },
]

const mockedDaily = new BigNumber(23.23)
const mockedWeekly = new BigNumber(-1.23)

const Discover: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const [search, setSearch] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<SearchFilters>({
      profile: true,
      artist: true,
      collection: true,
  })
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleSearchFilter = (value: string) => {
    setSearchFilter(prevState => ({
      ...prevState,
      [value]: !prevState[value]
    }))
  }
  const handleCloseSearch = () => {
    setAnchorEl(null);
  };

  // fetch collections (to use store instead)
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const getCollections = async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.listCollection();
      setCollections(result.result.entries);
    };
  
    getCollections();
  }, [network]);

  return (
    <ArkPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <Typography variant="h1">Featured</Typography>
        <Typography className={classes.titleDescription} variant="h4">Top NFTs at a glance. Ranked by volume, price and assets.</Typography>

        <CardActionArea
          component={RouterLink}
        //   to={`/ark/collections/${toBech32Address("ab")}`}
          to={`/ark/collections/abc`}
        >
          <CardMedia
            className={classes.image}
            component="img"
            alt="NFT Collection"
            height="308"
            // image={token.asset?.url}
          />
        </CardActionArea>

        <OutlinedInput
          placeholder="Search for an artist or a collection"
          value={search}
          fullWidth
          classes={{ input: classes.inputText }}
          className={classes.input}
          onChange={(e) => setSearch(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel className={classes.formLabel}>By</FormLabel>
                  {SEARCH_FILTERS.map((filter) => {
                    return (
                      <FormControlLabel
                        className={classes.formControlLabel}
                        value={filter}
                        control={
                          <Checkbox
                            className={classes.radioButton}
                            onChange={(e) => handleSearchFilter(filter)}
                            checkedIcon={<CheckedIcon />}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            disableRipple
                            checked={searchFilter[filter]}
                            // checked={false}
                          />
                        }
                        label={filter.toUpperCase()}
                      />
                    );
                  })}
              </FormControl>
            </InputAdornment>
          }
        />
      {/* <Autocomplete
          endAdornment={
            <InputAdornment position="end">
              <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel className={classes.formLabel}>By</FormLabel>
                  {SEARCH_FILTERS.map((filter) => {
                    return (
                      <FormControlLabel
                        className={classes.formControlLabel}
                        value={filter}
                        control={
                          <Checkbox
                            className={classes.radioButton}
                            onChange={(e) => handleSearchFilter(filter)}
                            checkedIcon={<CheckedIcon />}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            disableRipple
                            checked={searchFilter[filter]}
                            // checked={false}
                          />
                        }
                        label={filter.toUpperCase()}
                      />
                    );
                  })}
              </FormControl>
            </InputAdornment>
          }
      /> */}


        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                {HEADERS.map((header, index) => (
                  <TableCell
                    key={`offers-${index}`}
                    className={classes.headerCell}
                    align={header.align}
                  >
                    {header.value}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>

              <TableRow className={classes.tableRow}>
                <TableCell className={cls(classes.bodyCell, classes.firstCell)}>
                <Box display="flex" alignItems="center">
                  <div className={classes.index}>1</div>
                  <Avatar
                    className={classes.avatar}
                    alt="Avatar Image"
                    src={TEMP_BEAR_AVATAR_URL}
                  />
                  <div className={classes.collectionTitle}>
                    The Bear Market
                  </div>
                  <VerifiedBadge className={classes.verifiedBadge} />
                </Box>
                </TableCell>
                <TableCell align="center" className={classes.bodyCell}>

                  <Box display="flex" alignItems="center" justifyContent="center">
                    <strong className={classes.amount}>
                      100
                    </strong>
                    <CurrencyLogo currency="ZIL" className={classes.currencyLogo} />
                  </Box>

                </TableCell>
                <TableCell align="center" className={classes.bodyCell}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <strong className={classes.amount}>
                      100
                    </strong>
                    <CurrencyLogo currency="ZIL" className={classes.currencyLogo} />
                  </Box>
                </TableCell>
                <TableCell align="center" className={cls(classes.percentCell, { [classes.isNegative]: mockedDaily.isNegative() })}>
                  {mockedDaily.isPositive() ? '+' : '' }{mockedDaily.toFormat(2)}%
                </TableCell>
                <TableCell align="center" className={cls(classes.percentCell, { [classes.isNegative]: mockedWeekly.isNegative() })}>
                  {mockedWeekly.isPositive() ? '+' : '' }{mockedWeekly.toFormat(2)}%
                </TableCell>
                <TableCell align="center" className={classes.numberCell}>
                    1.2K
                </TableCell>
                <TableCell align="center" className={cls(classes.numberCell, classes.lastCell)}>
                    10K
                </TableCell>
              </TableRow>
              <TableRow className={classes.tableRow}>
                <TableCell align="center" className={classes.bodyCell}>
                  1 The Bear Market
                </TableCell>
                <TableCell align="right" className={classes.bodyCell}>
                    <strong className={classes.amount}>
                      100
                    </strong> ZIL
                </TableCell>
                <TableCell align="center" className={classes.bodyCell}>NYI</TableCell>
                <TableCell align="center" className={classes.bodyCell}>
                  sd
                </TableCell>
                <TableCell align="center" className={classes.bodyCell}>
                  asd
                </TableCell>
                <TableCell align="center" className={classes.bodyCell}>
                  <Typography>
                    helop
                  </Typography>
                </TableCell>
                <TableCell align="center" className={classes.bodyCell}>
                  <Typography>
                    10K
                  </Typography>
                </TableCell>
              </TableRow>

            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ArkPage>
  );
};

export default Discover;
