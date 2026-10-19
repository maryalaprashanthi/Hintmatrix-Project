import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import CourseService from "../../../services/CourseService";
import ChapterService from "../../../services/ChapterService";

import {
  FaBookOpen,
  FaPlayCircle,
  FaSearch,
  FaTimesCircle,
  FaLayerGroup,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import "./Courses.css";
import { canManageContent, currentRole, ROLES } from "../../../utils/roles";
import SubscriptionService from "../../../services/SubscriptionService";
import { getApiErrorMessage } from "../../../utils/apiError";
import { paths } from "../../../routes/paths";
import ConfirmDialog from "../../../components/Common/ConfirmDialog";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { useToast } from "../../../components/Toast/useToast";
import AddCourseModal from "./AddCourseModal";
import HierarchyProgress from "../../../components/Common/HierarchyProgress";
import { useHierarchyProgress } from "../../../hooks/useHierarchyProgress";

/* ================= 3D HELPERS ================= */

const roundedShape = (w, h, r) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const mesh = (geo, c) => {
  const m = new THREE.Mesh(
    geo,
    typeof c === "string"
      ? new THREE.MeshStandardMaterial({
          color: c,
          roughness: 0.45,
          metalness: 0.05,
        })
      : c,
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

const put = (p, m, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) => {
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  p.add(m);
  return m;
};

const group = (p, x = 0, y = 0, z = 0, ry = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  p.add(g);
  return g;
};

const rbox = (w, h, d, c) => {
  const b = Math.min(w, h, d) * 0.22;
  const geo = new THREE.ExtrudeGeometry(
    roundedShape(w - 2 * b, h - 2 * b, b * 0.6),
    {
      depth: d - 2 * b,
      bevelEnabled: true,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 4,
      curveSegments: 6,
    },
  );
  geo.center();
  return mesh(geo, c);
};

const cyl = (rt, rb, h, c, seg = 40) =>
  mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c);
const sph = (r, c) => mesh(new THREE.SphereGeometry(r, 40, 28), c);

const canvasTex = (w, h, draw) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/* ================= 3D OBJECTS ================= */

function book(p, w, h, d, c, x, y, z, ry) {
  const g = group(p, x, y, z, ry);
  put(g, rbox(w, h, d, c));
  put(g, rbox(w - 0.25, h - 0.2, d + 0.04, "#f6f2e8"), 0.08);
}

function stack(p, x, z, items) {
  const g = group(p, x, 0, z);
  let y = 0;
  items.forEach(([w, h, d, c], i) => {
    y += h / 2;
    book(g, w, h, d, c, 0, y, 0, i % 2 ? 0.1 : -0.06);
    y += h / 2;
  });
  return y;
}

function cap(p, x, y) {
  const g = group(p, x, y);
  put(g, rbox(3.4, 0.16, 3.4, "#262f55"), 0, 0, 0, Math.PI / 4);
  put(g, cyl(0.75, 0.8, 0.7, "#1e2848"), 0, -0.4);
  put(g, sph(0.12, "#f5b83d"), 0, 0.14);
  put(g, cyl(0.04, 0.04, 1, "#f5b83d", 12), 1.6, -0.5);
  put(g, rbox(0.22, 0.5, 0.22, "#e9a21f"), 1.6, -1.15);
}

const bars = (p, x, hs, cs) =>
  hs.forEach((h, i) =>
    put(p, rbox(0.7, h, 0.7, cs[i % cs.length]), x + i * 0.95, h / 2),
  );

function calc(p, x, ry) {
  const g = group(p, x, 0, 0, ry);
  put(g, rbox(2.1, 2.8, 0.6, "#2a3d68"), 0, 1.4);
  put(g, rbox(1.7, 0.6, 0.12, "#a8d4f7"), 0, 2.2, 0.3);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 3; c++)
      put(
        g,
        rbox(0.46, 0.34, 0.14, c === 2 && r > 1 ? "#f5a43d" : "#5f84c8"),
        (c - 1) * 0.58,
        1.55 - r * 0.45,
        0.3,
      );
}

function cup(p, x, z = 0) {
  const g = group(p, x, 0, z);
  put(g, cyl(0.4, 0.36, 0.9, "#2b86d6"), 0, 0.45);
  ["#e5484d", "#f5b83d", "#3aa76d"].forEach((c, i) =>
    put(
      g,
      cyl(0.06, 0.06, 0.9, c, 12),
      (i - 1) * 0.16,
      1.05,
      0,
      0,
      0,
      (1 - i) * 0.18,
    ),
  );
}

function plant(p, x, z = 0) {
  const g = group(p, x, 0, z);
  put(g, cyl(0.35, 0.28, 0.5, "#efe6da"), 0, 0.25);
  [-0.55, 0, 0.55].forEach((a) => {
    const leaf = sph(0.3, "#3f9e5c");
    leaf.scale.set(0.35, 1.3, 0.2);
    put(g, leaf, a * 0.5, 0.95, 0, 0, 0, -a);
  });
}

function letterCA(p, x, y) {
  const g = group(p, x, y);
  put(
    g,
    mesh(new THREE.TorusGeometry(1, 0.38, 24, 48, Math.PI * 1.5), "#2f7bf0"),
    -1.25,
    0,
    0,
    0,
    0,
    Math.PI / 4,
  );
  put(g, rbox(0.75, 2.8, 0.75, "#2f7bf0"), 0.8, 0, 0, 0, 0, -0.28);
  put(g, rbox(0.75, 2.8, 0.75, "#2f7bf0"), 1.9, 0, 0, 0, 0, 0.28);
  put(g, rbox(1.3, 0.32, 0.75, "#1b5fd6"), 1.35, -0.4);
}

function coin(p, x, y, ry) {
  const g = group(p, x, y, 0, ry);
  put(g, cyl(1.15, 1.15, 0.32, "#e39a12", 60), 0, 0, 0, 0, Math.PI / 2);
  const face = new THREE.MeshStandardMaterial({
    map: canvasTex(256, 256, (c, w) => {
      c.fillStyle = "#ffc83d";
      c.fillRect(0, 0, w, w);
      c.fillStyle = "#e39a12";
      c.font = "800 170px system-ui, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("₹", w / 2, w / 2 + 8);
    }),
    roughness: 0.4,
  });
  [1, -1].forEach((s) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.95, 48), face);
    m.position.z = 0.165 * s;
    m.rotation.y = s > 0 ? 0 : Math.PI;
    g.add(m);
  });
}

function globe(p, x) {
  const g = group(p, x);
  put(g, cyl(0.7, 0.8, 0.2, "#3a8e63"), 0, 0.1);
  put(g, cyl(0.07, 0.07, 0.8, "#caa24a", 16), 0, 0.5);
  const map = canvasTex(512, 256, (c, w, h) => {
    const grd = c.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#7fd0ff");
    grd.addColorStop(1, "#2a7bd8");
    c.fillStyle = grd;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#6fcf6a";
    [
      [90, 100, 60, 34],
      [210, 70, 46, 28],
      [300, 150, 70, 36],
      [420, 90, 50, 30],
      [150, 190, 40, 20],
    ].forEach(([cx, cy, rx, ry]) => {
      c.beginPath();
      c.ellipse(cx, cy, rx, ry, 0.4, 0, 7);
      c.fill();
    });
  });
  put(
    g,
    mesh(
      new THREE.SphereGeometry(1.15, 48, 32),
      new THREE.MeshStandardMaterial({ map, roughness: 0.5 }),
    ),
    0,
    1.95,
    0,
    0.6,
    0,
    0.35,
  );
  put(
    g,
    mesh(new THREE.TorusGeometry(1.3, 0.05, 12, 64, Math.PI), "#caa24a"),
    0,
    1.95,
    0,
    0,
    0,
    0.35,
  );
}

function openBook(p, x) {
  const g = group(p, x, 0, 0, -0.2);
  put(g, rbox(4, 0.25, 2.7, "#3a8e63"), 0, 0.125);
  put(g, rbox(1.85, 0.16, 2.4, "#f8f6ef"), -0.95, 0.38, 0, 0, 0, -0.14);
  put(g, rbox(1.85, 0.16, 2.4, "#f1eee5"), 0.95, 0.38, 0, 0, 0, 0.14);
}

function clipboard(p, x, ry) {
  const g = group(p, x, 0, 0, ry);
  put(g, rbox(2, 2.7, 0.16, "#e8f1fb"), 0, 1.5, 0, 0, -0.1);
  put(g, rbox(0.8, 0.28, 0.22, "#2f6fe4"), 0, 2.85, 0.05);
  for (let i = 0; i < 4; i++) {
    put(g, rbox(0.26, 0.26, 0.08, "#3aa76d"), -0.6, 2.15 - i * 0.55, 0.12);
    put(g, rbox(0.9, 0.12, 0.06, "#b8c9e0"), 0.2, 2.15 - i * 0.55, 0.12);
  }
}

function building(p, x) {
  const g = group(p, x, 0, 0, -0.2);
  put(g, rbox(3.4, 0.3, 1.7, "#e9dcc9"), 0, 0.15);
  put(g, rbox(3, 0.25, 1.5, "#f1e6d4"), 0, 0.425);
  [-1.05, -0.35, 0.35, 1.05].forEach((cx) =>
    put(g, cyl(0.2, 0.22, 1.4, "#e8a0a0"), cx, 1.25),
  );
  put(g, rbox(3.4, 0.3, 1.7, "#d9726f"), 0, 2.1);
  put(g, rbox(2.4, 0.28, 1.4, "#cf5f5c"), 0, 2.39);
  put(g, cyl(0.03, 0.03, 0.8, "#c8c8c8", 8), 0, 2.93);
  put(g, rbox(0.5, 0.3, 0.06, "#3b82f6"), 0.27, 3.18);
}

const orb = (p, x, y, z, c) => put(p, sph(0.38, c), x, y, z);

/* ================= SCENES ================= */

// Reused by several scenes: a book stack topped with a graduation cap.
const capStack = (w, x, items) => {
  const top = stack(w, x, 0, items);
  cap(w, x, top + 0.75);
};

const SCENES = {
  bcom: {
    bg: ["#cfe0ff", "#e9f1ff"],
    build: (w) => {
      capStack(w, -1.2, [
        [3.6, 0.55, 2.5, "#2e9e5b"],
        [3.3, 0.5, 2.3, "#f08a24"],
        [3.1, 0.5, 2.1, "#2f6fe4"],
      ]);
      bars(w, 1.9, [1.3, 2.1, 3], ["#3b82f6", "#2f6fe4", "#1f5bd6"]);
      orb(w, 4.7, 0.38, 0.2, "#c9d8ff");
      plant(w, -4.2);
    },
  },
  ca: {
    bg: ["#ffe3c4", "#fff1de"],
    build: (w) => {
      plant(w, -5.1);
      calc(w, -3.2, 0.3);
      const t = stack(w, 0.5, 0.2, [[3.9, 0.5, 2.7, "#3a8e63"]]);
      letterCA(w, 0.5, t + 1.4);
      cup(w, 3.6, 0.8);
      orb(w, 5.2, 0.38, 0.4, "#f3d9b0");
    },
  },
  cbse: {
    bg: ["#bfead9", "#e1f6ee"],
    build: (w) => {
      openBook(w, -1.9);
      globe(w, 2.3);
      cup(w, 0.6, 1.3);
      stack(w, -5, 0.4, [[1.6, 0.35, 1.1, "#2f6fe4"]]);
    },
  },
  jr: {
    bg: ["#dccdf7", "#efe7fc"],
    build: (w) => {
      calc(w, -3.4, 0.3);
      bars(
        w,
        -1.4,
        [1.4, 2.3, 3.1, 2.1],
        ["#f5a43d", "#8a63e0", "#3b82f6", "#8a63e0"],
      );
      coin(w, 3.3, 1.15, -0.35);
      plant(w, 5);
    },
  },
  combo: {
    bg: ["#bfe0fb", "#e2f2fe"],
    build: (w) => {
      capStack(w, -2.6, [
        [3.6, 0.55, 2.5, "#3a8e63"],
        [3.3, 0.5, 2.3, "#f08a24"],
        [3.1, 0.5, 2.1, "#2f6fe4"],
      ]);
      clipboard(w, 2.2, -0.25);
      plant(w, 4.9);
    },
  },
  inter: {
    bg: ["#ffd0d6", "#ffe9ec"],
    build: (w) => {
      capStack(w, -2.3, [
        [3.5, 0.5, 2.4, "#2f6fe4"],
        [3.2, 0.45, 2.2, "#f08a24"],
      ]);
      building(w, 2.5);
      stack(w, 5.3, 0.2, [
        [1.8, 0.35, 1.3, "#2f6fe4"],
        [1.6, 0.3, 1.2, "#3a8e63"],
      ]);
    },
  },
};

const SCENE_CYCLE = ["bcom", "cbse", "jr", "combo", "inter"];

/* ================= COURSE HELPERS ================= */

const isCAFoundation = (name = "") => /ca\s*foundation/i.test(name);

const getCourseId = (course) => course.courseId ?? course.id;

const isCourseActive = (course) =>
  course.activeRow !== false &&
  course.activeRow !== "false" &&
  course.activeRow !== 0;

// Chapter count from the course itself, falling back to the chapters table.
const getChapterCount = (course, chapters) => {
  const fromCourse = Number(
    course.chapters ?? course.chapterCount ?? course.totalChapters ?? 0,
  );
  if (Number.isFinite(fromCourse) && fromCourse > 0) return fromCourse;

  const courseId = String(getCourseId(course));
  return chapters.filter(
    (chapter) => String(chapter.courseId ?? chapter.course_id) === courseId,
  ).length;
};

/* ================= 3D BANNER ================= */

function CourseBanner3D({ scene: sceneKey }) {
  const wrapRef = useRef(null);
  const def = SCENES[sceneKey] || SCENES.bcom;

  useEffect(() => {
    const wrap = wrapRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c6e6, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(2, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -9,
      right: 9,
      top: 9,
      bottom: -9,
    });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.radius = 5;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.15 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const world = new THREE.Group();
    world.rotation.y = -0.08;
    scene.add(world);
    def.build(world);

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      const k = 2 * Math.tan(THREE.MathUtils.degToRad(15));
      const d = Math.max(4.9 / k, 11.5 / (k * camera.aspect));
      camera.position.set(0, 1.8 + d * 0.22, d);
      camera.lookAt(0, 1.85, 0);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      ro.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(
            (mm) => {
              if (mm.map) mm.map.dispose();
              mm.dispose();
            },
          );
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [def]);

  return (
    <div
      ref={wrapRef}
      className="cb-banner"
      style={{
        background: `radial-gradient(circle at 9% 78%, rgba(255,255,255,.55) 0 5%, transparent 5.5%), radial-gradient(circle at 93% 24%, rgba(255,255,255,.5) 0 4%, transparent 4.5%), linear-gradient(135deg, ${def.bg[0]}, ${def.bg[1]})`,
      }}
    />
  );
}

/* ================= PAGE ================= */

function Courses() {
  const navigate = useNavigate();
  const canManage = canManageContent();
  const isStudent = currentRole() === ROLES.STUDENT;
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignedCourseIds, setAssignedCourseIds] = useState(null);
  const [assignmentError, setAssignmentError] = useState(false);
  const courseProgress = useHierarchyProgress("course");

  const loadCourses = async () => {
    try {
      const response = await CourseService.getAllCourses();
      const allCourses = Array.isArray(response.data) ? response.data : [];
      if (isStudent) {
        const subscriptionResponse = await SubscriptionService.getMine();
        const activeSubscriptions = Array.isArray(subscriptionResponse.data)
          ? subscriptionResponse.data.filter(
              (subscription) =>
                subscription.active === true || subscription.active === "true",
            )
          : [];
        const assignedIds = activeSubscriptions
          .map(
            (subscription) =>
              subscription.courseId ??
              subscription.course?.courseId ??
              subscription.course?.id,
          )
          .filter((id) => id != null)
          .map(String);
        setAssignedCourseIds(new Set(assignedIds));
        setAssignmentError(false);
        setCourses(allCourses);
      } else {
        setCourses(allCourses);
      }
    } catch (error) {
      console.error("Failed to load backend courses:", error);
      if (isStudent) {
        setCourses([]);
        setAssignedCourseIds(new Set());
        setAssignmentError(true);
      }
    }
  };

  const loadChapters = () => {
    ChapterService.getAll()
      .then((response) =>
        setChapters(Array.isArray(response.data) ? response.data : []),
      )
      .catch((error) => console.error("Failed to load chapters:", error));
  };

  useEffect(() => {
    loadCourses();
    loadChapters();
  }, [isStudent]);

  const handleEdit = (courseData) => {
    setSelectedCourse(courseData);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  const del = useDeleteConfirm({
    entity: "course",
    deleteFn: (course) => CourseService.deleteCourse(getCourseId(course)),
    onDeleted: loadCourses,
  });

  const handleSave = async (courseRequestDTO, isEdit, courseId) => {
    try {
      if (isEdit) {
        await CourseService.updateCourse(courseId, courseRequestDTO);
        toast.success("Course updated.");
      } else {
        await CourseService.saveCourse(courseRequestDTO);
        toast.success("Course saved.");
      }
      closeModal();
      loadCourses();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to save course."));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await CourseService.uploadExcel(file);
      loadCourses();
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(getApiErrorMessage(error, "File upload failed."));
    }

    e.target.value = "";
  };

  const totals = useMemo(() => {
    const activeCourses = courses.filter(isCourseActive).length;
    return {
      totalChapters: courses.reduce(
        (sum, course) => sum + getChapterCount(course, chapters),
        0,
      ),
      activeCourses,
      inactiveCourses: courses.length - activeCourses,
    };
  }, [courses, chapters]);

  // FIX 2: bannerScenes was used but never defined.
  // CA Foundation courses get the "ca" scene; the rest cycle through SCENE_CYCLE.
  const bannerScenes = useMemo(() => {
    const map = {};
    let i = 0;
    courses.forEach((course) => {
      const id = getCourseId(course);
      const name = course.name || course.title || "";
      map[id] = isCAFoundation(name)
        ? "ca"
        : SCENE_CYCLE[i++ % SCENE_CYCLE.length];
    });
    return map;
  }, [courses]);

  const studentAssignedCourses =
    !isStudent || assignedCourseIds === null
      ? courses
      : courses.filter((course) => {
          const isActive =
            course.activeRow !== false &&
            course.activeRow !== "false" &&
            course.activeRow !== 0;
          return (
            isActive &&
            assignedCourseIds.has(String(course.courseId ?? course.id))
          );
        });

  const filteredCourses = studentAssignedCourses.filter((course) => {
    const courseTitle = course.name || course.title || "";

    const searchMatch = courseTitle
      .toLowerCase()
      .includes(search.toLowerCase());

    const isActive =
      course.activeRow !== false &&
      course.activeRow !== "false" &&
      course.activeRow !== 0;
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && isActive) ||
      (statusFilter === "INACTIVE" && !isActive);

    return searchMatch && statusMatch;
  });

  return (
    <div
      className={`container-fluid courses-page${isStudent ? " student-assigned-courses-page" : ""}`}
    >
      {/* ================= HEADER ================= */}
      <div className="courses-header">
        <div className="courses-title">
          <div className="courses-icon">
            <FaBookOpen />
          </div>
          <div>
            <h2>{isStudent ? "My Courses" : "Course Management"}</h2>

            <p>
              {isStudent
                ? "Continue learning from courses assigned to you."
                : "Create, organize and manage all your learning programs."}
            </p>
          </div>
        </div>

        <input
          type="file"
          id="courseUpload"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {canManage && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => document.getElementById("courseUpload").click()}
            >
              ⬆ Upload
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedCourse(null);
                setShowModal(true);
              }}
            >
              + Add Course
            </button>
          </div>
        )}
      </div>

      {/* ================= STATISTICS ================= */}

      {!isStudent && (
        <div className="row g-4 stats-row">
          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="modern-stat-card">
              <div className="stat-icon blue">
                <FaBookOpen />
              </div>

              <div>
                <small>Total Courses</small>
                <h3>{courses.length}</h3>
                {/* <span>Available Courses</span> */}
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="modern-stat-card">
              <div className="stat-icon green">
                <FaPlayCircle />
              </div>

              <div>
                <small>Active Courses</small>
                <h3>{totals.activeCourses}</h3>
                {/* <span>Currently Running</span> */}
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="modern-stat-card">
              <div className="stat-icon red">
                <FaTimesCircle />
              </div>

              <div>
                <small>Inactive Courses</small>
                <h3>{totals.inactiveCourses}</h3>
                {/* <span>Currently Inactive</span> */}
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="modern-stat-card">
              <div className="stat-icon orange">
                <FaLayerGroup />
              </div>

              <div>
                <small>Total Chapters</small>
                <h3>{totals.totalChapters}</h3>
                {/* <span>Learning Modules</span> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SEARCH ================= */}

      {!isStudent && (
        <div className="course-toolbar">
          <div className="search-box">
            <FaSearch
              className="search-icon"
              onClick={() => {
                console.log("Search icon clicked");
              }}
            />

            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select category-filter status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter courses by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      )}

      {/* ================= COURSE GRID ================= */}

      {isStudent && assignmentError && (
        <div className="alert alert-danger" role="alert">
          Assigned courses could not be loaded. Please try again.
        </div>
      )}
      {isStudent && assignedCourseIds === null && !assignmentError && (
        <div className="course-loading-state" role="status">
          Loading your assigned courses…
        </div>
      )}
      <div className="row">
        {filteredCourses.map((course) => {
          const courseId = getCourseId(course);
          const active = isCourseActive(course);

          return (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={courseId}>
              <div className="course-card h-100">
                <div className="course-banner">
                  <CourseBanner3D scene={bannerScenes[courseId]} />
                </div>

                <div className="course-content">
                  <h4>{course.name || course.title}</h4>

                  {!isStudent && (
                    <span
                      className={
                        course.activeRow
                          ? "status-badge active"
                          : "status-badge inactive"
                      }
                    >
                      {course.activeRow ? "Active" : "Inactive"}
                    </span>
                  )}

                  <p className="course-level">{course.level || "Beginner"}</p>

                  <div className="course-details">
                    <div>
                      <FaLayerGroup />
                      <span>{getChapterCount(course, chapters)} Chapters</span>
                    </div>
                  </div>

                  <div className="hierarchy-card-footer">
                    <HierarchyProgress
                      label="Course"
                      value={courseProgress(courseId)}
                    />

                    <button
                      className="course-btn mt-auto"
                      disabled={!active}
                      onClick={() => navigate(paths.courseSubjects(courseId))}
                    >
                      <FaBookOpen />
                      <span>{active ? "View Subjects" : "Inactive"}</span>
                    </button>

                    {canManage && (
                      <div className="course-actions">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEdit(course)}
                        >
                          <FaEdit className="me-1" />
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => del.request(course)}
                        >
                          <FaTrash className="me-1" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= EMPTY ================= */}

      {filteredCourses.length === 0 &&
        !(isStudent && assignedCourseIds === null) &&
        !assignmentError && (
          <div className="empty-state">
            <h4>
              {isStudent ? "No courses assigned yet" : "No Courses Found"}
            </h4>

            <p>
              {isStudent
                ? "Courses assigned to your account will appear here."
                : "Try another search keyword or select another category."}
            </p>
          </div>
        )}

      <AddCourseModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSave}
        selectedCourseData={selectedCourse}
      />

      <ConfirmDialog
        open={Boolean(del.pending)}
        title={`Delete "${del.pending?.name || del.pending?.title || "this course"}"?`}
        body="Every subject, chapter, topic and question under this course will be removed. This can't be undone."
        confirmLabel="Delete course"
        loading={del.deleting}
        error={del.error}
        onConfirm={del.confirm}
        onCancel={del.close}
      />
    </div>
  );
}

export default Courses;
