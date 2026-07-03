import numpy as np
import unittest

from api.analysis import _binary_defect_map


class AnalysisTests(unittest.TestCase):
    def test_binary_defect_map_marks_bright_defects_not_background(self) -> None:
        arr = np.zeros((64, 64), dtype=np.float32)
        arr[8:56, 8:56] = 0.05
        arr[28:36, 28:36] = 0.95

        defect_map = _binary_defect_map(arr)

        self.assertEqual(defect_map[32, 32], 1)
        self.assertEqual(defect_map[0, 0], 0)
        self.assertEqual(defect_map[16, 16], 0)
        self.assertGreaterEqual(int(defect_map.sum()), 40)
        self.assertLessEqual(int(defect_map.sum()), 120)


if __name__ == "__main__":
    unittest.main()
