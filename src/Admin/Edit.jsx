import React, { useEffect, useState } from "react";
import { FormControl, TextField, Button, Snackbar, Alert } from "@mui/material";
import { UpdateRecipe, fetchRecipe } from "../firebase/firebase";
import { alpha } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function Add() {
  let { recipeId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [cookTime, setCookTime] = useState(0);
  const [prepTime, setPrepTime] = useState(0);
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("");
  const [protein, setProtein] = useState("");
  const [notes, setNotes] = useState("");
  const [directionsCount, setDirectionsCount] = useState(1);

  const [successful, setSuccessful] = useState(false);
  const [error, setError] = useState(false);
  const [directions, setDirections] = useState([""]);

  const [loading, setLoading] = useState([""]);

  useEffect(() => {
    let isMounted = true;
    onAuthStateChanged(auth, (user) => {
      if (!user || !user.email === process.env.REACT_APP_EMAIL) {
        if (isMounted) {
          navigate("/home");
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        await fetchRecipe(recipeId).then((result) => {
          const r = result.data;
          console.log(r);
          setCategory(r.category.join(","));
          setCookTime(parseInt(r.details.cookTime));
          setDescription(r.description);
          setDirections(r.directions);
          setIngredients(r.ingredients.join(","));
          setName(r.name);
          setImgUrl(r.image);
          setNotes(r.notes.join(","));
          setPrepTime(parseInt(r.details.prepTime));
          setProtein(r.protein);
          setDirectionsCount(directions.length);
        });
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setError(true);
      }
    })();
  }, [recipeId, directions.length]);

  const SubmitData = async () => {
    const strCookTime = `${cookTime}min`;
    const strPrepTime = `${prepTime}min`;
    const strTotalTime = `${cookTime + prepTime}min`;
    const data = {
      data: {
        name,
        name_lower: name.toLowerCase(),
        description,
        protein,
        image: imgUrl,
        details: {
          cookTime: strCookTime,
          prepTime: strPrepTime,
          totalTime: strTotalTime,
        },
        ingredients: ingredients.split(",").map((ing) => ing.trim()),
        directions,
        category: category.split(",").map((cat) => cat.trim()),
        notes: notes.length ? notes.split(",").map((note) => note.trim()) : [],
      },
    };

    try {
      await UpdateRecipe(data, recipeId).then((result) => {
        setSuccessful(true);
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      });
    } catch (e) {
      console.log(e);
      setError(true);
    }
  };

  const handleDirections = (e, i) => {
    let newDirections = [...directions];
    newDirections[i] = e.target.value;
    setDirections(newDirections);
  };

  const handleRemoveDirections = () => {
    let newDirections = [...directions];
    newDirections.splice(directionsCount - 1, 1);
    setDirections(newDirections);
    setDirectionsCount(directionsCount - 1);
  };

  const directionsEl = [];

  for (let i = 0; i < directionsCount; i++) {
    directionsEl.push(
      <TextField
        key={i}
        id="filled-multiline-static"
        label="Direction"
        value={directions[i]}
        placeholder="Enter direction"
        onChange={(e) => handleDirections(e, i)}
        variant="filled"
      />
    );
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSuccessful(false);
    setError(false);
  };

  return (
    <FormControl fullWidth>
      <FormControl
        sx={{
          "& > :not(style)": { m: 1, width: "50%" },
          display: "flex",
          flexDirection: "row",
        }}
        fullWidth
      >
        <TextField
          id="filled-basic"
          onChange={(e) => setName(e.target.value)}
          label="Name"
          value={name}
          variant="filled"
        />
        <TextField
          id="filled-basic"
          onChange={(e) => setProtein(e.target.value)}
          label="Protein"
          value={protein}
          variant="filled"
        />
      </FormControl>
      <FormControl
        sx={{
          "& > :not(style)": { m: 1 },
        }}
      >
        <TextField
          id="filled-basic"
          onChange={(e) => setImgUrl(e.target.value)}
          label="Image URL"
          value={imgUrl}
          variant="filled"
        />
        <TextField
          id="filled-multiline-static"
          label="Description"
          onChange={(e) => setDescription(e.target.value)}
          multiline
          value={description}
          rows={4}
          variant="filled"
        />
      </FormControl>
      <FormControl
        sx={{
          "& > :not(style)": { m: 1, width: "50%" },
          display: "flex",
          flexDirection: "row",
        }}
      >
        <TextField
          id="filled-basic"
          onChange={(e) => setCookTime(e.target.value)}
          label="Cook Time"
          value={cookTime}
          variant="filled"
        />
        <TextField
          id="filled-basic"
          onChange={(e) => setPrepTime(e.target.value)}
          label="Prep Time"
          value={prepTime}
          variant="filled"
        />
      </FormControl>
      <FormControl
        sx={{
          "& > :not(style)": { m: 1 },
        }}
      >
        <TextField
          id="filled-multiline-static"
          label="Category"
          placeholder="Enter category in comma separated list"
          onChange={(e) => setCategory(e.target.value)}
          multiline
          value={category}
          rows={4}
          variant="filled"
        />
        <TextField
          id="filled-multiline-static"
          label="Ingredients"
          placeholder="Enter ingredients in comma separated list"
          onChange={(e) => setIngredients(e.target.value)}
          multiline
          value={ingredients}
          rows={4}
          variant="filled"
        />
        {directionsEl}
        <Button
          onClick={() => {
            setDirectionsCount(directionsCount + 1);
            setDirections([...directions, ""]);
          }}
        >
          Add Direction
        </Button>
        <Button
          disabled={directionsCount === 1}
          onClick={handleRemoveDirections}
        >
          Remove Direction
        </Button>
        <TextField
          id="filled-multiline-static"
          label="Notes*"
          placeholder="Enter notes in comma separated list"
          onChange={(e) => setNotes(e.target.value)}
          multiline
          value={notes}
          rows={4}
          variant="filled"
        />
      </FormControl>
      <Button
        sx={{
          background: alpha("#FF7892", 0.6),
          "&:hover": {
            backgroundColor: alpha("#FF7892", 0.8),
          },
          fontFamily: "'Acme', sans-serif",
        }}
        onClick={SubmitData}
        variant="contained"
      >
        Update
      </Button>
      {successful && (
        <Snackbar
          open={successful}
          autoHideDuration={6000}
          onClose={handleClose}
          message="Recipe has been updated!"
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Recipe has been updated!
          </Alert>
        </Snackbar>
      )}
      {error && (
        <Snackbar
          severity="error"
          open={error}
          autoHideDuration={6000}
          onClose={handleClose}
          message="Error has occurred!"
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            Oopsie woopsie UwU we made a fucky wucky!
          </Alert>
        </Snackbar>
      )}
    </FormControl>
  );
}
